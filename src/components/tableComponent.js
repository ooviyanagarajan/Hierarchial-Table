import React, { useState } from "react";
import { Table, Button } from "antd";
import tableData from "./tableData.json";

const HierarchicalTable = () => {

    let formattedData=tableData.rows;
     const [initialData] = useState(formattedData);
  const [data, setData] = useState(formattedData || []);



const getOriginalValue = (id,list=initialData) => {
for (let i of list) {
    if (i.id === id) return i.value;
    if (i.children) {
    const found = getOriginalValue(id, i.children);
    if (found) return found;
    }
}
};
const calcVariance = (current, orig) => {
if (!orig) return "0%";
return (((current - orig) / orig) * 100).toFixed(2) + "%";
};
const calcTotals = (arr) =>
    arr.map((n) => {
      if (n.children) {
        const updated = calcTotals(n.children);
        const total = updated.reduce((a, c) => a + c.value, 0);
        return { ...n, children: updated, value: total };
      }
      return n;
    });
const handleUpdate = (id, newVal, type) => {
const update = (list) =>
    list.map((item) => {
    if (item.id === id) {
        let newValue =''
       if (type === "%") {
        newValue = item.value + (item.value * newVal) / 100;
        } else if (type === "val") {
        newValue = item.value + newVal; 
        }

    
        if (item.children) {
        const total = item.children.reduce((a, c) => a + c.value, 0);
        const computedVal = total ? newValue / total : 0;
        const newChildren = item.children.map((c) => ({
            ...c,
            value: c.value * computedVal,
            variance: calcVariance(c.value * computedVal, getOriginalValue(c.id)),
        }));
        return {
            ...item,
            value: newValue,
            children: newChildren,
            variance: calcVariance(newValue, getOriginalValue(id)),
        };
        }

        return {
        ...item,
        value: newValue,
        variance: calcVariance(newValue, getOriginalValue(id)),
        };
    }

    if (item.children)
        return { ...item, children: update(item.children) };

    return item;
    });

let updated= update(data);
let finalData=calcTotals(updated);
setData(finalData);

};
const updateInputValue = (item, id, value) => {
  if (item.id === id) return { ...item, inputValue: value };
  if (item.children) {
    return { ...item, children: item.children.map((c) => updateInputValue(c, id, value)) };
  }
  return item;
};

  const columns = [
    {
      title: "Label",
      dataIndex: "label",
      key: "label",
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value"
    },
    {
        title:"Input",
        dataIndex:"input",
        key:"input",
        render: (value, record) => {
        return (
          <input
            type="number"
             value={record.inputValue || ""} // read directly from data
            onChange={(e) => {
                const newValue = e.target.value;
                setData((prevData) =>
                prevData.map((item) => updateInputValue(item, record.id, newValue))
                );
            }}
          />
        
        );
      },

    },
    {
      title: "Allocation %",
      dataIndex: "value",
      key: "value",
    render: (value, record) => {
        return (
          <Button  onClick={(e) =>  handleUpdate(record.id, parseFloat(record.inputValue), "%") }  variant="filled" color="default">Allocation %</Button>
        
        );
      },
    },
     {
      title: "Allocation Val",
      dataIndex: "value",
      key: "value",
        render: (value, record) => {
        return (
          <Button onClick={(e) =>  handleUpdate(record.id, parseFloat(record.inputValue), "val")  } variant="filled" color="default">Allocation Val</Button>
        
        );
      },
    },
    {
      title: "Variance %",
      dataIndex: "variance",
      key: "variance",
       "suffix": "%",
        render: (text) => <span>{text || "0%"}</span>,
    },
  ];

  return (
    <Table columns={columns} dataSource={data} pagination={false} rowKey="id" />
  );
};

export default HierarchicalTable;



