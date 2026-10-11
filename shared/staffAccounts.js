(function () {
    const STORAGE_KEY = "ManagedStaff";
    const HASH_ITERATIONS = 120000;

    function encodeBase64(bytes) {
        let binary = "";
        bytes.forEach(function (byte) {
            binary += String.fromCharCode(byte);
        });
        return window.btoa(binary);
    }

    async function derivePasswordHash(password, salt) {
        if (!window.crypto || !window.crypto.subtle) {
            throw new Error("Secure password storage is unavailable in this browser.");
        }

        const saltBytes = salt
            ? Uint8Array.from(window.atob(salt), function (character) {
                return character.charCodeAt(0);
            })
            : window.crypto.getRandomValues(new Uint8Array(16));
        const key = await window.crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(password),
            "PBKDF2",
            false,
            ["deriveBits"]
        );
        const bits = await window.crypto.subtle.deriveBits({
            name: "PBKDF2",
            salt: saltBytes,
            iterations: HASH_ITERATIONS,
            hash: "SHA-256"
        }, key, 256);

        return {
            passwordSalt: encodeBase64(saltBytes),
            passwordHash: encodeBase64(new Uint8Array(bits))
        };
    }

    function getStaff() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === null) {
            return [{ id: "STAFF-1", name: "Benjamin", username: "Benjamin" }];
        }

        const staff = JSON.parse(saved);
        if (!Array.isArray(staff)) {
            throw new Error("Saved staff accounts are invalid.");
        }
        return staff;
    }

    async function createCredentials(password) {
        return derivePasswordHash(password);
    }

    async function authenticate(username, password) {
        const identifier = username.trim().toLowerCase();
        const staff = getStaff().find(function (member) {
            return (member.username || member.name || "").trim().toLowerCase() === identifier;
        });
        if (!staff) {
            return null;
        }

        if (!staff.passwordHash || !staff.passwordSalt) {
            return staff.name === "Benjamin" && identifier === "benjamin" && password === "12345"
                ? { id: staff.id, name: staff.name, role: staff.role || "Manager" }
                : null;
        }

        const credentials = await derivePasswordHash(password, staff.passwordSalt);
        if (credentials.passwordHash !== staff.passwordHash) {
            return null;
        }
        return { id: staff.id, name: staff.name, role: staff.role };
    }

    window.StaffAccounts = Object.freeze({
        createCredentials: createCredentials,
        authenticate: authenticate
    });
})();
