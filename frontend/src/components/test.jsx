
import React from 'react';
import { useState } from 'react';
import { Alert } from 'react-bootstrap';

export const GitHubFiles = (props, {className}) => {
    const [data, setData] = useState(0);
    var remaing = 60
    const [reset, setReset] = useState(new Date());
    const getData = async () => {
        if (data !== 0) return

        fetch("https://api.github.com/repos/AppliedEnergistics/Applied-Energistics-2/git/trees/aabb99d9e6b1b331bed790b8581bc4857aa48bbb", {
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'request'
            },
        }).then(async (r) => {
            remaing = r.headers.get("X-RateLimit-Remaining")
            setReset(remaing = new Date(r.headers.get("X-RateLimit-Reset")*1000))
            const json = await r.json();
            setData(json);
        }).catch((e) => console.log(e))

    }
    getData();

    const render = () => {
        if (data === 0) return "Loading..."
        if ("tree" in data) {

            return data.tree.map((e) => <>{e.path} <br/></>)
        }
        return <Alert variant="warning"> Error: {data.message}<br/> Reset at: {reset.toLocaleString()}</Alert>
    }
    return <div className="pt-3" >
        {
           render()
        }
    </div>;
};
