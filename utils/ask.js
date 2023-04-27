import readline from "readline";

/**
 * @param { string } question
 * @description Просим пользователя ввести ответ, на какой либо вопрос при помощи обычного ввода.
 * @return {Promise<string>}
 */
export default async function ask(question) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })

        rl.question(question + ' ', (response) => {
            resolve(response)
            rl.close()
        })
    })
}