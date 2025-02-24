import * as BUI from "@thatopen/ui";
import { createRef } from "lit/directives/ref.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../firebase";

interface LoginModalState {
    loginError?: string;
    registerError?: string;
    }

    let updateLoginModal: any;

    const [loginModal, updateModal] = BUI.Component.create<
    HTMLDialogElement,
    LoginModalState
    >((state: LoginModalState) => {
    const { loginError, registerError } = state;

    const signInEmailRef = createRef<BUI.TextInput>();
    const signInPasswordRef = createRef<BUI.TextInput>();
    const registerEmailRef = createRef<BUI.TextInput>();
    const registerPasswordRef = createRef<BUI.TextInput>();

    const onSignInClick = async () => {
        const { value: emailInput } = signInEmailRef;
        const { value: passwordInput } = signInPasswordRef;
        if (!(emailInput && passwordInput)) return;
        const email = emailInput.value;
        const password = passwordInput.value;
        if (email.trim() === "" || password.trim() === "") return;
        try {
        await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
        updateLoginModal?.({ loginError: error });
        }
    };

    const onRegisterClick = async () => {
        const { value: emailInput } = registerEmailRef;
        const { value: passwordInput } = registerPasswordRef;
        if (!(emailInput && passwordInput)) return;
        const email = emailInput.value;
        const password = passwordInput.value;
        if (email.trim() === "" || password.trim() === "") return;
        try {
        await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
        updateLoginModal?.({ registerError: error });
        }
    };
    return BUI.html`
    <div style="display: flex; justify-content: center; align-items: center;">
        <bim-tabs style="width: 17rem; border-radius: 0.375rem;" switchers-full>
        <bim-tab label="Iniciar Sesión">
            <div style="padding: 1rem; display: flex; flex-direction: column; gap: 1rem">
            <img src="./src/Logo_Ineco.png" style="width: 8rem; margin: 0.5rem auto">
            <bim-text-input label="Email" vertical ${BUI.ref(signInEmailRef)}></bim-text-input>
            <bim-text-input label="Contraseña" type="password" vertical ${BUI.ref(signInPasswordRef)}></bim-text-input>
            <bim-button @click=${onSignInClick} label="Entrar"></bim-button>
            ${
                loginError
                ? BUI.html`
                    <bim-label style="color: rgb(197, 79, 79); white-space: normal;">${loginError}</bim-label>
                    `
                : null
            }
            </div>
        </bim-tab>
        <bim-tab label="Registro">
            <div style="padding: 1rem; display: flex; flex-direction: column; gap: 1rem">
            <img src="./src/Logo_Ineco.png" style="width: 8rem; margin: 0.5rem auto">
            <bim-text-input label="Email" vertical ${BUI.ref(registerEmailRef)}></bim-text-input>
            <bim-text-input label="Contraseña" type="password" vertical ${BUI.ref(registerPasswordRef)}></bim-text-input>
            <bim-button @click=${onRegisterClick} label="Registrar"></bim-button>
                ${
                registerError
                    ? BUI.html`
                    <bim-label style="color: rgb(197, 79, 79); white-space: normal;">${registerError}</bim-label>
                    `
                    : null
                }
            </div>
        </bim-tab>
        </bim-tabs>
    </div>
    `;
}, {});

updateLoginModal = updateModal;

export default loginModal;

