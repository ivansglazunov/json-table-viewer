import React from "react";

import { withStyles } from "@material-ui/core/styles";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";

import Button from "@material-ui/core/Button";

import Paper from "@material-ui/core/Paper";

import Checkbox from "@material-ui/core/Checkbox";

import FilterList from "@material-ui/icons/FilterList";
import Add from "@material-ui/icons/Add";
import Remove from "@material-ui/icons/Remove";
import Clear from "@material-ui/icons/Clear";
import Sync from "@material-ui/icons/Sync";

import TextField from "@material-ui/core/TextField";

import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

import * as _ from "lodash";

const styles = theme => ({
  root: {
    minWidth: 50,
    maxWidth: 50
  }
});

class FilterComponent extends React.Component {
  state = {
    open: false,
    anchorEl: null,
    filter: this.getFilter()
  };
  onClose = () => this.setState({ open: false });
  handleChangeTab = (event, value) => {
    const { filter } = this.state;
    const { uniqueValues, column, onChange } = this.props;

    if (value === "allowed" || value === "denied") {
      filter.value.type = value;
      onChange(filter.value);
    } else if (value === "invert") {
      for (var v = 0; v < uniqueValues[column].length; v++) {
        let value = uniqueValues[column][v];
        if (_.includes(filter.value.list, value)) {
          _.remove(filter.value.list, v => v === value);
        } else {
          filter.value.list.push(value);
        }
      }
      onChange(filter.value);
    } else if (value === "clear") {
      filter.value.list = [];
      onChange(filter.value);
    }
  };
  componentWillReceiveProps(nextProps) {}
  getFilter() {
    const { config: { filtered }, column } = this.props;
    const filter = _.find(filtered, { id: column }) || {
      id: column,
      value: {
        type: "denied",
        list: [],
        regexp: ""
      }
    };
    if (!_.isObject(filter.value)) filter.value = {};
    if (!_.isString(filter.value.type)) filter.value.type = "denied";
    if (!_.isArray(filter.value.list)) filter.value.list = [];
    if (!_.isString(filter.value.regexp)) filter.value.regexp = "";
    return filter;
  }
  render() {
    const { anchorEl, open, filter } = this.state;
    const { column, onChange, uniqueValues, classes } = this.props;

    return (
      <span>
        <TextField
          value={filter.value.regexp}
          placeholder="regexp"
          onChange={event => {
            filter.value.regexp = event.target.value;
            onChange(filter.value);
          }}
          margin="dense"
          fullWidth
          style={{
            marginTop: 0
          }}
          InputProps={{
            startAdornment: (
              <Button
                size="small"
                style={{
                  textTransform: "none",
                  minWidth: 30,
                  minHeight: 0,
                  padding: 0
                }}
                onClick={event => {
                  this.setState({
                    anchorEl: event.target,
                    open: !open
                  });
                }}
              >
                <FilterList
                  color={
                    filter.value.type === "denied" && !filter.value.list.length
                      ? "inherit"
                      : "secondary"
                  }
                />
              </Button>
            )
          }}
        />
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={this.onClose}
          PaperProps={{
            style: {
              maxHeight: 300,
              width: 300
            }
          }}
          MenuListProps={{
            style: {
              paddingTop: 0
            }
          }}
        >
          <Paper
            style={{
              position: "sticky",
              top: 0,
              zIndex: 2
            }}
          >
            <Tabs value={filter.value.type} onChange={this.handleChangeTab}>
              <Tab
                value="allowed"
                icon={<Add />}
                classes={{ label: classes.label, root: classes.root }}
              />
              <Tab
                value="denied"
                icon={<Remove />}
                classes={{ label: classes.label, root: classes.root }}
              />
              <Tab
                value="invert"
                icon={<Sync />}
                classes={{ label: classes.label, root: classes.root }}
              />
              <Tab
                value="clear"
                icon={<Clear />}
                classes={{ label: classes.label, root: classes.root }}
              />
            </Tabs>
          </Paper>
          {uniqueValues[column].map(value => (
            <MenuItem key={`key-${value}`} dense={true}>
              {value}
              <ListItemSecondaryAction>
                <Checkbox
                  checked={_.includes(filter.value.list, value)}
                  onClick={() => {
                    const index = filter.value.list.indexOf(value);
                    if (index > -1) filter.value.list.splice(index, 1);
                    else filter.value.list.push(value);
                    onChange(filter.value);
                  }}
                />
              </ListItemSecondaryAction>
            </MenuItem>
          ))}
        </Menu>
      </span>
    );
  }
}

export default withStyles(styles)(FilterComponent);
