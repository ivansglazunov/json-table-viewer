import React from "react";

import ReactTable from "react-table";
import "react-table/react-table.css";

import * as _ from "lodash";

import Filter from "./filter";

class Table extends React.Component {
  generateColumns = () => {
    const { data, columns, maxValues } = this.props;

    return columns.map(column => ({
      Header: () => <div>{column}</div>,
      accessor: column,
      filterMethod: (filter, row) => {
        return true;
      },
      Filter: ({ filter, onChange }) => (
        <Filter {...this.props} column={column} onChange={onChange} />
      ),
      Cell: row => {
        return (
          <div style={{ position: "relative" }}>
            <div
              style={{
                backgroundColor: "black",
                opacity: 0.1,
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                width: `${Math.round(
                  parseFloat(row.value) / maxValues[column] * 100
                )}%`
              }}
            />
            {row.value}
          </div>
        );
      }
    }));
  };
  onSortedChange = sorted => {
    this.props.saveConfig({ sorted });
  };
  onPageChange = page => {
    this.props.saveConfig({ page });
  };
  onPageSizeChange = pageSize => {
    this.props.saveConfig({ pageSize });
  };
  onFilteredChange = filtered => {
    this.props.saveConfig({ filtered });
  };
  render() {
    const { data } = this.props;
    const {
      columns,
      config: { sorted, filtered, page, pageSize }
    } = this.props;

    return (
      <ReactTable
        data={data}
        columns={this.generateColumns()}
        onPageChange={this.onPageChange}
        page={page}
        onPageSizeChange={this.onPageSizeChange}
        pageSize={pageSize}
        onSortedChange={this.onSortedChange}
        sorted={sorted}
        onFilteredChange={this.onFilteredChange}
        filterable
        defaultSortMethod={(a, b, desc) => {
          // force null and undefined to the bottom
          a = a === null || a === undefined ? -Infinity : a;
          b = b === null || b === undefined ? -Infinity : b;
          // convert to number if possible
          if (!_.isNaN(parseFloat(a)) && !_.isNaN(parseFloat(b))) {
            if (parseFloat(a) > parseFloat(b)) return 1;
            if (parseFloat(a) < parseFloat(b)) return -1;
          } else {
            // force any string values to lowercase
            a = typeof a === "string" ? a.toLowerCase() : a;
            b = typeof b === "string" ? b.toLowerCase() : b;
            // Return either 1 or -1 to indicate a sort priority
            if (a > b) return 1;
            if (a < b) return -1;
          }
          // returning 0 or undefined will use any subsequent column sorting methods or the row index as a tiebreaker
          return 0;
        }}
      />
    );
  }
}

export default Table;
