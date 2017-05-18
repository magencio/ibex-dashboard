import * as request from 'xhr-request';

import { DataSourcePlugin, IOptions } from './DataSourcePlugin';
import GraphQLConnection from '../connections/graphql';
import { DataSourceConnector } from '../DataSourceConnector';

let connectionType = new GraphQLConnection();

interface IGraphQLParams {
  query: string;
  variables: Object;
}

export default class GraphQL extends DataSourcePlugin<IGraphQLParams> {
  type = 'GraphQL';
  defaultProperty = 'data';
  connectionType = connectionType.type;

  constructor(options: IOptions<IGraphQLParams>, connections: IDict<IStringDictionary>) {
    super(options, connections);
    this.validateParams(this._props.params);
  }

  updateDependencies(dependencies: any) {
    // Ensure dependencies exist
    const isAnyDependencyMissing = Object.keys(this.getDependencies()).some(key => dependencies[key] == null);
    if (isAnyDependencyMissing) {
      return dispatch => dispatch();
    }

    // Validate connection
    const connection = this.getConnection();
    const { serviceUrl } = connection;
    if (!connection || !serviceUrl) {
      return dispatch => dispatch();
    }

    const params = this.getParams();
    const { query, variables } = params;

    return dispatch => {
      request(serviceUrl, {
        method: 'POST',
        json: true,
        body: {
          query: query,
          variables: variables
        }
      },      (error, json) => {
        if (error) {
          console.log(error);
          return this.failure(error);
        }

        return dispatch(json);
      });
    };
  }

  updateSelectedValues(dependencies: IDictionary, selectedValues: any) {
    if (Array.isArray(selectedValues)) {
      return Object.assign(dependencies, { 'selectedValues': selectedValues });
    } else {
      return Object.assign(dependencies, { ... selectedValues });
    }
  }

  private validateParams(params: IGraphQLParams): void {
    return;
  }
}