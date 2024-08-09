const { app } = require("electron");
const fs = require("node:fs") as typeof import("fs");
const path = require("node:path") as typeof import("path");

type data = {
    [key: string]: unknown;
};

class Store {
    private configPath: string;

    constructor() {
        this.configPath = path.join(app.getPath("userData"), "config.json");
        if (!fs.existsSync(this.configPath)) {
            this.init();
        }
    }

    private init() {
        fs.writeFileSync(this.configPath, "{}");
    }

    private getStore() {
        let str = "{}";
        try {
            str = fs.readFileSync(this.configPath).toString() || "{}";
        } catch (error) {
            this.init();
        }
        return JSON.parse(str) as data;
    }

    private setStore(data: data) {
        fs.writeFileSync(this.configPath, JSON.stringify(data, null, 2));
    }

    // biome-ignore lint: any input
    public set(keyPath: string, value: any): void {
        const store = this.getStore();
        const pathx = keyPath.split(".");
        let obj = store;
        for (let i = 0; i < pathx.length; i++) {
            const p = pathx[i];
            if (i === pathx.length - 1) obj[p] = value;
            else {
                if (obj[p]?.constructor !== Object) {
                    if (!Number.isNaN(Number(pathx[i + 1]))) {
                        obj[p] = [];
                    } else {
                        obj[p] = {};
                    }
                }
                // @ts-ignore
                obj = obj[p];
            }
        }
        this.setStore(store);
    }
    // biome-ignore lint: any out
    public get(keyPath: string): any {
        const store = this.getStore();
        const pathx = keyPath.split(".");
        const lastp = pathx.pop();
        const lastobj = pathx.reduce((p, c) => {
            return p[c] || {};
        }, store);
        return lastobj[lastp];
    }

    public clear() {
        this.init();
    }
}

export default Store;
