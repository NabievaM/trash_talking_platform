import Auth from "../../layouts/Auth.vue";

export default [
    {
        path: "signup",
        name: "SignUp",
        component: () => import("../../pages/SignUp.vue"),
        meta: {
            layout: Auth,
            title: "Sign Up"
        }
    }
];
