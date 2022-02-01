import React from "react";
import Sketch from "react-p5";
import Cookies from 'js-cookie'
import config from "../config";
import droneImg from "../assets/done.png"
import { Button, Form, InputGroup, Ratio } from "react-bootstrap";

export const vector = {
    add: (a, b) => {
        return {
            x: (a.x + b.x),
            z: (a.z + b.z),
        };
    },

    subtract: (a, b) => {
        return {
            x: (a.x - b.x),
            z: (a.z - b.z),
        };
    },
    mutiply: (a, b) => {
        return {
            x: (a.x * b.x),
            z: (a.z * b.z),
        };
    },
    devide: (a, b) => {
        return {
            x: (a.x * b.x),
            z: (a.z * b.z),
        };
    },
    set: (a, b) => {
        a.x = b.x;
        a.z = b.z;
    },
    round: (a) => {
        a.x = Math.round(a.x);
        a.z = Math.round(a.z);
    }
}

export default class Map extends React.Component {
    constructor(props) {
        super(props)

        this.center = { x: 0, z: 0 };
        this.s = 1;
        this.picSize = 512;
        this.mPos = { x: 0, z: 0 };
        this.sPos = { x: 0, z: 0 };
    }

    imgCache = {}

    resetPosition = () => {
        this.mPos.x = 0;
        this.mPos.z = 0;
        this.s = 1;
        this.updateSize();
        this.saveCookies();
    }

    loadImg = async (name) => {
        if (!(name in this.imgCache) && this.imgIndex.includes(name)) {
            this.imgCache[name] = this.p5.loadImage(`${config.apiURL}/assets/img/map/${name}.png`);
        }
    }

    pos2Canvers(pos) {
        return {
            x: pos.x * this.s + this.sPos.x,
            z: pos.z * this.s + this.sPos.z
        }
    }

    pos2Map(pos) {

    }

    updateSize = () => {
        this.w = this.parent.offsetWidth
        this.h = this.parent.offsetHeight
        this.center.x = this.w / 2;
        this.center.z = this.h / 2;
        this.c = this.w / (this.picSize * this.s) + 4;
        this.r = this.h / (this.picSize * this.s) + 4;
        this.p5.resizeCanvas(this.w, this.h)
    }

    saveCookies = () => {
        Cookies.set("map_settings", JSON.stringify({ pos: this.mPos, scale: this.s }))
    }

    setup = async (p5_, parent_) => this.setupMap(p5_, parent_);

    handleMove = (e) => {
        e.preventDefault()
        const p5 = this.p5;
        const s = this.s
        this.mousePos = { x: p5.mouseX / s, z: p5.mouseY / s }
        if (this.reset) {
            this.reset = false
            this.startMousePos = this.mousePos
            this.smPos = this.mousePos;
        }
        if (p5.mouseIsPressed) {
            if (e.type === "touchmove")
                this.mPos = vector.add(this.smPos, vector.subtract(this.startMousePos, this.mousePos))
            else
                this.mPos = vector.subtract(this.mPos, { x: e.movementX / s, z: e.movementY / s })
            this.saveCookies()
        }
        return false
    }

    setupMap = async (p5_, parent_) => {
        this.p5 = p5_;
        this.parent = parent_;

        var cookies = Cookies.get("map_settings")
        if (cookies !== undefined) {
            cookies = await JSON.parse(cookies)
            this.mPos = cookies.pos;
            this.s = cookies.scale;
        }

        this.imgIndex = await (await fetch(`${config.apiURL}/assets/img/map/index`)).json()

        this.updateSize();
        var cnv = this.p5.createCanvas(this.w, this.h).parent(parent_);

        //Register events:
        cnv.mouseWheel((e) => {
            e.preventDefault();
            if (e.wheelDelta < 0)
                this.s *= .95;
            else
                this.s *= 1.05;
            if (this.s > 10) this.s = 10;
            if (this.s < 0.5) this.s = 0.5;
            this.updateSize()
            this.saveCookies();
        });

        this.parent.addEventListener('contextmenu', event => {
            event.preventDefault()
        });

        cnv.mouseMoved((e) => this.handleMove(e))
        cnv.touchMoved((e) => this.handleMove(e))
        cnv.touchEnded((e) => {
            this.reset = true;
        });

        new ResizeObserver(() => {
            this.updateSize()
        }).observe(parent_)

    };

    drawMap = (p5) => {
        // Process mouse
        if (this.p5.mouseIsPressed) {
            this.parent.style.cursor = "grabbing"
        } else {
            this.parent.style.cursor = "grab"
        }

        // Clear canvers
        this.p5.clear();

        // Convert map position to convers possition
        this.sPos = vector.mutiply(this.mPos, { x: -this.s, z: -this.s });
        this.p5.translate(this.center.x, this.center.z);
        var cc = this.p5.floor(this.c / 2);
        var rc = this.p5.floor(this.r / 2);
        var sPicSize = this.picSize * this.s;

        // Draw map
        p5.imageMode(p5.CORNER);
        p5.noSmooth();
        var imgPos = { x: this.p5.floor(this.mPos.x / 512), z: this.p5.floor(this.mPos.z / 512) };
        var offset = {
            x: this.sPos.x + imgPos.x * sPicSize,
            z: this.sPos.z + imgPos.z * sPicSize
        }
        for (let pxm = -cc; pxm < cc; pxm++) {
            for (var pzm = -rc; pzm < rc; pzm++) {
                const imgName = `${imgPos.x + pxm},${imgPos.z + pzm}`
                if (imgName in this.imgCache) {
                    var sx = sPicSize * pxm + offset.x;
                    var sz = sPicSize * pzm + offset.z;
                    this.p5.image(this.imgCache[imgName], sx, sz, sPicSize, sPicSize)
                } else {
                    this.loadImg(imgName)
                }
            }
        }
        p5.smooth();
    };

    draw = (p5) => this.drawMap(p5);


    render = () => {
        return <Ratio aspectRatio="4x3" className="border border-5 rounded rounded-3">
            <Sketch setup={this.setup} draw={this.draw} className="w-100 h-100" />
        </Ratio>;
    }
};



/**
 * Done Map
 * 
 * A map that inclued drones and drone paths 
 */
export class DroneMap extends Map {

    constructor(props) {
        super(props)
        this.show = props.show;
        if (this.show === undefined) this.show = "address"
        this.showMap = {
            "Mail Adresses": "address",
            "All": "all",
            "None": "none"
        };
        this.data = {}
        this.state = { drones: [], map: {} }
    }

    setup = async (p5_, parent_) => {
        this.setupMap(p5_, parent_);
        this.droneImg = p5_.loadImage(droneImg)
    }

    componentDidMount = () => {
        this.interval = setInterval(() => this.updateData(), 1000);
    }

    componentWillUnmount = () => {
        clearInterval(this.interval)
    }

    async updateData() {
        try {
            const data = this.data;
            data.map = await (await fetch(`${config.apiURL}/map`)).json();
            const lines = [];
            for (let aName in data.map) {
                const a = data.map[aName];
                for (let bName in a.connected) {
                    const filtered = lines.filter(a => a[0] === aName && a[1] === bName)
                    if (filtered.length === 0)
                        lines.push([bName, aName])
                }
            }
            data.lines = lines

            data.drones = await (await fetch(`${config.apiURL}/drones`)).json()
            for (let k in data.drones) data.drones[k].uuid = k

            const state = this.state
            const droneArray = Object.values(data.drones).filter(v => v.connected).sort((a, b) => a.targetPoint.localeCompare(b.targetPoint));
            state.drones = droneArray
            state.map = data.map;

            this.setState(state)
        } catch (e) {
            console.log(e);
        }
    }


    writeCurcle(message, pos, r) {
        const p5 = this.p5;
        var arclength = 0;
        var wm = .5
        for (var i = 0; i < message.length; i++) {
            // Instead of a constant width, we check the width of each character.
            var currentChar = message.charAt(i);
            var w = p5.textWidth(currentChar);

            // Each box is centered so we move half the width
            arclength += w * wm;
            // Angle in radians is the arclength divided by the radius
            // Starting on the left side of the circle by adding PI
            var theta = 2 + arclength / r;

            p5.push();
            // Polar to cartesian coordinate conversion
            p5.translate(pos.x + r * p5.cos(theta), pos.z + r * p5.sin(theta));
            // Rotate the box
            p5.rotate(theta + p5.PI / 2); // rotation is offset by 90 degrees

            // Display the character
            p5.text(currentChar, 0, 0);
            p5.pop();
            // Move halfway again
            arclength += w * wm;
        }
    }

    draw = (p5) => {
        this.drawMap(p5);
        this.show = this.props.show;
        if (this.show === undefined) this.show = "address"
        var s = this.s;
        if (!this.data.map) return
        p5.stroke(155, 0, 155)
        p5.strokeWeight(4);
        for (var i in this.data.lines) {
            var line = this.data.lines[i];
            var a = this.pos2Canvers(this.data.map[line[0]])
            var b = this.pos2Canvers(this.data.map[line[1]])
            p5.line(a.x, a.z, b.x, b.z)
        }
        p5.fill(255, 255, 255)
        p5.textSize(2.4 * s);
        p5.strokeWeight(1 * s);
        for (let name in this.data.map) {
            const p = this.data.map[name]
            const sp = this.pos2Canvers(p)
            p5.ellipse(sp.x, sp.z, 2 * s, 2 * s)
        }
        p5.strokeWeight(.3 * s);
        if (this.show !== "none")
            for (let name in this.data.map) {
                const p = this.data.map[name]
                const sp = this.pos2Canvers(p)
                if (this.show === "address")
                    if (!name.endsWith("-m") && !name.endsWith("-dev")) continue
                this.writeCurcle(name, sp, 2.8 * s)
            }
        p5.fill(255, 150, 0)
        p5.noStroke();
        for (var uuid in this.data.drones) {
            const drone = this.data.drones[uuid];
            const dPos = this.pos2Canvers(drone.lastLocation)
            p5.ellipse(dPos.x, dPos.z, 20 * s)
            p5.imageMode(p5.CENTER);
            p5.image(this.droneImg, dPos.x, dPos.z, 15 * s, 15 * s)
        }
    }

    handleChangeShow = (e) => {
        this.show = this.showMap[e.target.value]
        console.log(this.show);

    }

    render = () => {
        return <div>
            <Ratio aspectRatio="4x3" className="border border-5 rounded rounded-3">
                <Sketch setup={this.setup} draw={this.draw} className="w-100 h-100" />
            </Ratio>

            <InputGroup className="mt-3">
                <InputGroup.Text>Point names:</InputGroup.Text>
                <Form.Control as="select" onChange={this.handleChangeShow}>
                    {Object.keys(this.showMap).map(k => <option key={k}>{k}</option>)}
                </Form.Control>
                <Button onClick={this.resetPosition}>Reset Positon</Button>
            </InputGroup>
            <InputGroup className="mt-3">
                <InputGroup.Text>Drone:</InputGroup.Text>
                <Form.Control as="select">
                    {this.state.drones.map(v => <option key={v.uuid} value={v.uuid}>{v.uuid} | {v.targetPoint}</option>)}
                </Form.Control>
                <InputGroup.Text>{this.state.drones.length} connected.</InputGroup.Text>
            </InputGroup>
            <InputGroup className="mt-3">
                <InputGroup.Text>Target:</InputGroup.Text>
                <Form.Control as="select">
                    {Object.keys(this.state.map).map(k => <option key={k}>{k}</option>)}
                </Form.Control>
            </InputGroup>
        </div>;
    }
}