import React from "react";
import { withRouter } from "react-router";

import Grid from "@material-ui/core/Grid";

import * as _ from "lodash";
import $ from "jquery";

import Path from "./path";
import Table from "./table";
import Sort from "./sort";

let timeout;
class Page extends React.Component {
  getDefaultState = () => ({ data: [], columns: [], uniqueValues: {} });
  state = this.getDefaultState();
  getDefaultConfig = () => ({
    path: "",
    sorted: [],
    filtered: [],
    page: 0,
    pageSize: 50
  });
  getConfig = (props = this.props) => {
    var urlConfig = this.getDefaultConfig();
    try {
      urlConfig = _.defaults(
        JSON.parse(decodeURIComponent(props.match.params.config)),
        urlConfig
      );
    } catch (error) {}
    return urlConfig;
  };
  saveConfig = newConfig => {
    const config = this.getConfig();
    this.props.history.push(
      `/${encodeURIComponent(JSON.stringify(_.extend(config, newConfig)))}`
    );
  };
  load() {
    const config = this.getConfig();
    this.setState(this.getDefaultState());
    $.getJSON(config.path).done(data => {
      if (_.isArray(data)) {
        const columns = _.uniq(_.flatten(_.map(data, value => _.keys(value))));
        const uniqueValues = {};
        _.each(columns, column => {
          uniqueValues[column] = uniqueValues[column] || [];
          uniqueValues[column] = _.map(
            _.uniqBy(data, column),
            row => row[column]
          );
        });

        this.setState({ data, columns, uniqueValues });
      }
    });
  }
  componentDidUpdate(prevProps) {
    const prevConfig = this.getConfig(prevProps);
    const config = this.getConfig(this.props);
    if (prevConfig.path !== config.path) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.saveConfig(
          _.defaults({ path: config.path }, this.getDefaultConfig())
        );
        this.load();
      }, 500);
    }
  }
  componentDidMount() {
    this.load();
  }
  render() {
    const { data, columns } = this.state;
    const config = this.getConfig();
    const { filtered } = config;

    const maxValues = {};
    const filteredData = _.filter(data, row => {
      var filter;
      for (var f = 0; f < filtered.length; f++) {
        filter = filtered[f];
        if (filter.value) {
          if (filter.value.allowed && filter.value.allowed.length) {
            if (!_.includes(filter.value.allowed, row[filter.id])) return false;
          }
          if (filter.value.regexp) {
            try {
              if (!new RegExp(filter.value.regexp).test(row[filter.id]))
                return false;
            } catch (error) {}
          }
        }
      }

      for (let c = 0; c < columns.length; c++) {
        maxValues[columns[c]] = maxValues[columns[c]] || 0;
        let value = parseFloat(row[columns[c]]);
        if (
          !_.isNumber(maxValues[columns[c]]) ||
          maxValues[columns[c]] < value
        ) {
          maxValues[columns[c]] = value;
        }
      }

      return true;
    });

    const args = {
      ...this.state,
      config,
      saveConfig: this.saveConfig,
      data: filteredData,
      maxValues
    };

    return (
      <Grid container>
        <Grid item xs={12} md={6} style={{ padding: 6 }}>
          <Path config={config} saveConfig={this.saveConfig} />
        </Grid>
        <Grid item xs={12} md={6} style={{ padding: 6 }}>
          <Sort {...args} />
        </Grid>
        <Grid item xs={12}>
          <Table {...args} />
        </Grid>
      </Grid>
    );
  }
}

export default withRouter(Page);
