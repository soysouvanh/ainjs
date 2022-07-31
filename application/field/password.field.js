module.exports = {
	label: "Mot de passe",
	title: "Mot de passe",
	description: null,
	type: "password",
	step: null,
	values: null,
	defaultValue: null,
	helpMessage: null,
	placeholder: null,
	format: {
		value: null,
		message: "Le mot de passe est incorrect."
	},
	required: {
		value: true,
		message: "Le mot de passe est obligatoire."
	},
	min: {
        value: null,
        message: null
    },
    max: {
        value: null,
        message: null
    },
	minLength: {
		value: 8,
		message: "Le mot de passe doit faire minimum 8 caractères avec au moins une majuscule, une minuscule, un chiffre et caractère spécial."
	},
	maxLength: {
		value: 255,
		message: "Le mot de passe est incorrect."
	},
	messages: {
		AccessDenied: "E-mail ou mot de passe incorrect.",
		CreateCookieImpossible: "Création de votre session impossible.<br/>Veuillez paramétrer votre navigateur pour qu'il accepte les cookies.",
		PasswordTooShort: "Le mot de passe doit faire minimum 8 caractères.",
		PasswordTooLong: "Le mot de passe est limité à 255 caractères.",
		NumericCharacterExpected: "Le mot de passe doit contenir au moins un chiffre.",
		LowercaseLetterExpected: "Le mot de passe doit contenir au moins une lettre en minuscule.",
		UppercaseLetterExpected: "Le mot de passe doit contenir au moins une lettre en capital.",
		SpecialCharacterExpected: "Le mot de passe doit contenir au moins un caractère spécial."
	}
};