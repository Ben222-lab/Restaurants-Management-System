(function () {
    const STORAGE_KEY = "CustomerAccounts";
    const HASH_ITERATIONS = 120000;

    function getAccounts() {
        const storedAccounts = localStorage.getItem(STORAGE_KEY);
        if (storedAccounts === null) {
            return [];
        }

        const accounts = JSON.parse(storedAccounts);
        if (!Array.isArray(accounts)) {
            throw new Error("Saved customer accounts are invalid.");
        }

        return accounts;
    }

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
            salt: encodeBase64(saltBytes),
            passwordHash: encodeBase64(new Uint8Array(bits))
        };
    }

    async function create(account) {
        const accounts = getAccounts();
        const email = account.email.trim().toLowerCase();
        const username = account.username.trim().toLowerCase();
        const duplicate = accounts.some(function (savedAccount) {
            return savedAccount.email.toLowerCase() === email ||
                savedAccount.username.toLowerCase() === username;
        });

        if (duplicate) {
            throw new Error("That email or username is already registered.");
        }

        const credentials = await derivePasswordHash(account.password);
        accounts.push({
            name: account.name.trim(),
            username: account.username.trim(),
            email: email,
            salt: credentials.salt,
            passwordHash: credentials.passwordHash
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    }

    function getAll() {
        return getAccounts().map(function (account) {
            return {
                name: account.name,
                username: account.username,
                email: account.email
            };
        });
    }

    function updateProfile(email, profile) {
        const accounts = getAccounts();
        const account = accounts.find(function (item) {
            return item.email.toLowerCase() === email.toLowerCase();
        });
        if (!account) {
            throw new Error("The customer account could not be found.");
        }

        const nextEmail = profile.email.trim().toLowerCase();
        const nextUsername = profile.username.trim().toLowerCase();
        const duplicate = accounts.some(function (item) {
            return item !== account &&
                (item.email.toLowerCase() === nextEmail ||
                    item.username.toLowerCase() === nextUsername);
        });
        if (duplicate) {
            throw new Error("That email or username is already registered.");
        }

        account.name = profile.name.trim();
        account.username = profile.username.trim();
        account.email = nextEmail;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
        return {
            name: account.name,
            username: account.username,
            email: account.email
        };
    }

    function remove(email) {
        const accounts = getAccounts();
        const remainingAccounts = accounts.filter(function (account) {
            return account.email.toLowerCase() !== email.toLowerCase();
        });
        if (remainingAccounts.length === accounts.length) {
            throw new Error("The customer account could not be found.");
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remainingAccounts));
    }

    async function authenticate(identifier, password) {
        const normalizedIdentifier = identifier.trim().toLowerCase();
        const account = getAccounts().find(function (savedAccount) {
            return savedAccount.email.toLowerCase() === normalizedIdentifier ||
                savedAccount.username.toLowerCase() === normalizedIdentifier;
        });

        if (!account) {
            return null;
        }

        const credentials = await derivePasswordHash(password, account.salt);
        if (credentials.passwordHash !== account.passwordHash) {
            return null;
        }

        return {
            name: account.name,
            email: account.email
        };
    }

    window.CustomerAccounts = Object.freeze({
        create: create,
        authenticate: authenticate,
        getAll: getAll,
        updateProfile: updateProfile,
        remove: remove
    });
})();
