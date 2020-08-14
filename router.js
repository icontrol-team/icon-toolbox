import { h } from "hyperapp";
const routerRunner = (props, dispatch) => {
    console.log("routing");
    function onLocationChanged() {
        console.log(window.location.pathname);
        for (const r of props.routes) {
            if (r.path === window.location.pathname) {
                props.matched(r, dispatch);
                return;
            }
        }
        props.matched(undefined, dispatch);
    }

    const push = window.history.pushState;
    const replace = window.history.replaceState;
    window.history.pushState = function(data, title, url) {
        push.call(this, data, title, url);
        onLocationChanged();
    };
    window.history.replaceState = function(data, title, url) {
        replace.call(this, data, title, url);
        onLocationChanged();
    };
    window.addEventListener("popstate", onLocationChanged);

    onLocationChanged();

    return () => {
        console.log("unrouting");
        window.history.pushState = push;
        window.history.replaceState = replace;
        window.removeEventListener("popstate", onLocationChanged);
    };
};

export const createRouter = props => ({
    effect: routerRunner,
    ...props
});

export const pushHistory = props => ({
    effect: (props, dispatch) => {
        window.history.pushState(null, "", props.pathname);
    },
    ...props
});

export function Link(props, children) {
    return h("a", { onClick: [MoveTo, props.to], href: props.to }, children);
}

const MoveTo = (state, to, ev) => {
    ev.preventDefault();
    return [state, pushHistory({ pathname: to })];
};