import ask from "../utils/ask.js";
import User from "./User.js";

const STOP_WORD = 'stop'
// TODO вероятно стоит отвязаться от терминала и написать полноценную модель, к которой уже сделать контроллер.
export default class WordGame {
    /**
     * @private
     * @type {boolean}
     */
    isWork = false

    /**
     * @type {User[]}
     */
    players = [new User('Kotaro'), new User('Mem')]

    fallPlayers = []
    /**
     * @type User
     */
    currenPlayer

    /**
     * @type {string[]}
     */
    namedWords = []

    //TODO К сожалению, мы сейчас не пишем, какое конкретно правило, вызвало ошибку, нужно подумать, как это сделать. В идеале, сделать так, что бы клиентский код мог добавлять любые правила.
    //TODO реально ли сделать анализатор текста, что типо мол введенное слово, не является словом. Вероятно нужно использовать библиотеку Natural.JS
    //TODO а что если выкидывать ошибку, которую потом можно перехватить, уже с текстом ???
    rules = [
        word => this.namedWords.length ? this.lastSymbolWord === word[0] : true,
        word => word !== STOP_WORD,
        word => !Array.from(word).filter(i => !isNaN(i)).length,
        word => /^[а-яА-Я]+$/.test(word),
        word => word.length > 1
    ]

    async createGame() {
        console.log('Пожалуйста добавьте пользователей в игру.')
        console.log('Для этого введите имя пользователя.')
        console.log(`Для игры пользователей должно быть как минимум 2е.`)
        console.log(`Если хотите прекратить добавлять пользователей, введите "${STOP_WORD}"`)
        // await this.getPlayers()
        this.currenPlayer = this.players[0]
        // this.rules = await getAllRules()

    }

    async startGame() {
        this.isWork = true
        console.log(`Что бы сдаться введите ${STOP_WORD}`)

        while (this.isWork) {
            if (this.players.length < 2) {
                this.stopGame(`Победил пользователь под именем ${this.currenPlayer.name}`)
                continue
            }
            const response = await ask(this.startMessage)

            if (response === STOP_WORD) {
                this.toFall()
                this.setNextCurrentUser()
                continue
            }

            if (this.checkRules(response)) {
                this.addNamedWord(response)
                this.setNextCurrentUser()
            }
        }
    }

    /**
     * @param { string } word
     * @private
     */
    addNamedWord(word) {
        let fixWord = word.trim().toLowerCase()
        this.namedWords.push(fixWord)
    }

    setNextCurrentUser() {
        const indexNow = this.players.findIndex(player => player === this.currenPlayer)
        this.currenPlayer = this.players[indexNow + 1] ? this.players[indexNow + 1] : this.players[0]

        return this.currenPlayer
    }

    checkRules(word) {
        for (let rule of this.rules) {
            if (!rule(word)) {
                console.log('Что то пошло не так')
                return false
            }
        }

        return true
    }

    /**
     * @private
     */
    stopGame(message) {
        console.log(message)
        this.isWork = false
    }

    // TODO реализовать метод.
    /**
     * @private
     */
    toFall() {
        this.players = this.players.filter(i => i.name !== this.currenPlayer.name)
        this.fallPlayers.push(this.currenPlayer)
    }

    /**
     * @private
     */
    get startMessage() {
        if (!this.namedWords.length) {
            return  `Пользователь ${this.currenPlayer.name} введите первое слово:`
        }


        return `Пользователь ${this.currenPlayer.name} введите слово на букву "${this.lastSymbolWord}":`
    }

    /**
     * @private
     */
    get lastSymbolWord() {
        if (!this.namedWords.length) return ''
        const currentWord = this.namedWords[this.namedWords.length - 1]
        return currentWord[currentWord.length - 1]
    }

    // Думаю что пользователей можно получать не в контексте класса WordGame, а делать это раньше
    /**
     * @return {Promise<*|User[]>}
     * @private
     */
    async getPlayers() {
        const name = await ask('Имя пользователя:')
        if (name === STOP_WORD) {
            return this.players
        }

        if (this.players.map(i => i.name).includes(name)) {
            console.log('Данное имя пользователя уже есть, попробуйте другое имя.')
            return this.getPlayers()
        }

        this.players.push(new User(name))
        return this.getPlayers()
    }
}