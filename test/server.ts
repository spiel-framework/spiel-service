import {After, AfterAll, Before, BeforeAll, Delete, Endpoint, Get, HttpError,
    IRouterOptions, IUrl, middleware, Post, Put, Response,
    Road, Server, SetRouter} from "../src";
import {users} from "./assets";

const app = new Road();

const server = new Server(app, (error: any) => {
    switch (error.code) {
        case 404:
            return new Response("Not Found", 404);
        case 405:
            return new Response("Not Allowed", 405);
        default:
        case 500:
            return new Response(error.message, 500);
    }
});

const info = (method: string, path: string, body: any, headers: Headers, next: () => any) => {
    if (path.match(/^\/user/g)) {
        console.log(`A ${method} request was made to ${JSON.stringify(path)}`);
        return next();
    } else {
        return next();
    }
};

const infoAll = (method: string, path: string, body: any, headers: Headers, next: () => any) => {
    console.log("The middleware start");
    return next();
};

const changeResponse = (method: string, path: string, body: any, headers: Headers, next: () => any) => {
    if (path.match(/^\/greeting/g)) {
        console.log("End");
        return new Response({greet: "Bye"}, 200);
    } else {
        return next();
    }
};

const finish = (method: string, path: string, body: any, headers: Headers, next: () => any) => {
    console.log("Finish");
    return next();
};

@BeforeAll(infoAll)
@AfterAll(finish)
@Endpoint("user")
class User {
    private body: any;

    @Before(info)
    @Get("")
    public getUsers() {
        return new Response(users, 200);
    }
    @Get("#id")
    public getUser(url: IUrl) {
        console.log(url);
        const id = url.args.id;
        const user: any = users.find((elment) => elment.id === id);
        return new Response(user, 200);
    }

    @Post("")
    public addUser(url: IUrl) {
        const user = this.body;
        users.push(user);
        return new Response(users, 200);
    }

    @Put("#id")
    public updateUser(url: IUrl) {
        const id = url.args.id;
        const resp = users.map((user) => {
            const value = user;
            if (value.id === id) {
                value.permission = this.body.permission;
            }
            return value;
        });
        if (!resp) {
            return new HttpError("User not found", 404);
        } else {
            return new Response(resp, 200);
        }
    }

    @Delete("#id")
    public deleteUser(url: IUrl) {
        const id = url.args.id;
        const index = users.findIndex((user: any) => user.id === id);
        users.splice(index, 1);
        return new Response(users, 200);
    }
}

@Endpoint("greeting")
class Greeting {
    @After(changeResponse)
    @Get("")
    public getGreeting(url: any, body: any, headers: any, next: () => {}) {
        console.log("HELLO EVERYBODY");
        return next();
    }
}

const endpoints = [new User(), new Greeting()];

const configRouter: IRouterOptions = {
  connectionMode: true,
  endpoints,
  road: app,
  verbose: true,
};

new SetRouter(configRouter);

server.listen(3000, () => {
  console.log("Serve is running in the port 3000");
});
