import { useAlert } from './context/AlertContext'
import { useState, useEffect } from 'react'
import { Grid } from './components/grid/Grid'
import { Keyboard } from './components/keyboard/Keyboard'
import { InfoModal } from './components/modals/InfoModal'
import { StatsModal } from './components/modals/StatsModal'
import { SettingsModal } from './components/modals/SettingsModal'
import { AlertContainer } from './components/alerts/AlertContainer'
import {
  WIN_MESSAGES,
  GAME_COPIED_MESSAGE,
  NOT_ENOUGH_LETTERS_MESSAGE,
  WORD_NOT_FOUND_MESSAGE,
  CORRECT_WORD_MESSAGE,
  DEFINITION_MESSAGE,
} from './constants/strings'
import {
  MAX_CHALLENGES,
  REVEAL_TIME_MS,
  GAME_LOST_INFO_DELAY,
  WELCOME_INFO_MODAL_MS,
} from './constants/settings'
import {
  isWordInWordList,
  isWinningWord,
  solution,
  unicodeLength,
} from './lib/words'
import { addStatsForCompletedGame, loadStats } from './lib/stats'
import {
  loadGameStateFromLocalStorage,
  saveGameStateToLocalStorage,
  setStoredIsHighContrastMode,
  getStoredIsHighContrastMode,
} from './lib/localStorage'
import { default as GraphemeSplitter } from 'grapheme-splitter'
type Props = {
  language: string
  solution: string
  definition: string
}

export const Game = ({ language, solution, definition }: Props) => {
  const { showError: showErrorAlert, showSuccess: showSuccessAlert } =
    useAlert()
  const translate = require('translate-google-api')
  const [sols, setSols] = useState(solution)
  const [buttonName, setButtonName] = useState('Show Definition')
  const [currentGuess, setCurrentGuess] = useState('')
  const [currentRowClass, setCurrentRowClass] = useState('')
  const [isRevealing, setIsRevealing] = useState(false)
  const [isGameWon, setIsGameWon] = useState(false)
  const [isGameLost, setIsGameLost] = useState(false)
  const [revealDefinition, setRevealDefinition] = useState(false)
  const [guesses, setGuesses] = useState<string[]>(() => {
    const loaded = loadGameStateFromLocalStorage()
    if (loaded?.solution !== solution) {
      return []
    }
    const gameWasWon = loaded.guesses.includes(solution)
    if (gameWasWon) {
      setIsGameWon(true)
      showErrorAlert(DEFINITION_MESSAGE(solution, definition), {
        persist: true,
      })
    }
    if (loaded.guesses.length === MAX_CHALLENGES && !gameWasWon) {
      setIsGameLost(true)
      showErrorAlert(CORRECT_WORD_MESSAGE(solution), {
        persist: false,
      })
      showErrorAlert(DEFINITION_MESSAGE(solution, definition), {
        persist: true,
      })
    }
    return loaded.guesses
  })
  const [stats, setStats] = useState(() => loadStats())
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const clearCurrentRowClass = () => {
    setCurrentRowClass('')
  }

  const translateSolution = async (language: string): Promise<string> => {
    const result = await translate(solution, {
      tld: 'en',
      to: language,
    })

    return result
  }
  translateSolution(language).then((value) => {
    const str: string = value
    setSols(str)
  })

  const trans = () => {
    translateSolution(language)
    console.log(sols)
    return sols
  }
  useEffect(() => {
    // if no game state on load,
    // show the user the how-to info modal
    if (!loadGameStateFromLocalStorage()) {
      setTimeout(() => {
        setIsInfoModalOpen(true)
      }, WELCOME_INFO_MODAL_MS)
      translateSolution(language)
    }
  }, [language, translateSolution(language)])
  useEffect(() => {
    saveGameStateToLocalStorage({
      guesses,
      solution,
    })
  }, [guesses, solution])

  useEffect(() => {
    if (isGameWon) {
      console.log('game won')
      const winMessage =
        WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)]
      const delayMs = REVEAL_TIME_MS * solution.length
      showSuccessAlert(DEFINITION_MESSAGE(solution, definition), {
        delayMs,
        persist: true,
      })
      showSuccessAlert(winMessage, {
        delayMs,
        onClose: () => setIsStatsModalOpen(true),
      })
    }

    if (isGameLost) {
      setTimeout(() => {
        setIsStatsModalOpen(true)
      }, GAME_LOST_INFO_DELAY)
    }
  }, [isGameWon, isGameLost, showSuccessAlert])

  const onChar = (value: string) => {
    if (
      unicodeLength(`${currentGuess}${value}`) <= solution.length &&
      guesses.length < MAX_CHALLENGES &&
      !isGameWon
    ) {
      setCurrentGuess(`${currentGuess}${value}`)
    }
  }
  const onDelete = () => {
    setCurrentGuess(
      new GraphemeSplitter().splitGraphemes(currentGuess).slice(0, -1).join('')
    )
  }

  const onEnter = () => {
    if (isGameWon || isGameLost) {
      return
    }

    if (!(unicodeLength(currentGuess) === solution.length)) {
      setCurrentRowClass('jiggle')
      return showErrorAlert(NOT_ENOUGH_LETTERS_MESSAGE, {
        onClose: clearCurrentRowClass,
      })
    }

    setIsRevealing(true)
    // turn this back off after all
    // chars have been revealed
    setTimeout(() => {
      setIsRevealing(false)
    }, REVEAL_TIME_MS * solution.length)

    const winningWord = isWinningWord(currentGuess, solution)

    if (
      unicodeLength(currentGuess) === solution.length &&
      guesses.length < MAX_CHALLENGES &&
      !isGameWon
    ) {
      setGuesses([...guesses, currentGuess])
      setCurrentGuess('')

      if (winningWord) {
        setStats(addStatsForCompletedGame(stats, guesses.length))
        return setIsGameWon(true)
      }

      if (guesses.length === MAX_CHALLENGES - 1) {
        setStats(addStatsForCompletedGame(stats, guesses.length + 1))
        setIsGameLost(true)
        showErrorAlert(CORRECT_WORD_MESSAGE(solution), {
          persist: false,
          delayMs: REVEAL_TIME_MS * solution.length + 1,
        })
      }
    }
  }

  const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
    // Preventing the page from reloading
    event.preventDefault()
    setRevealDefinition(!revealDefinition)
    if (!revealDefinition) {
      setButtonName('Hide Definition')
    } else {
      setButtonName('Show Definition')
    }
  }
  return (
    <div className="h-screen flex flex-col">
      <div className="pb-6 grow">
        <label>{language}</label>
        <form onSubmit={submitForm}>
          <button type="submit" className="btn">
            {buttonName}
          </button>
        </form>
        <div> {revealDefinition && <p> {definition}</p>}</div>
        <Grid
          guesses={guesses}
          currentGuess={currentGuess}
          isRevealing={isRevealing}
          currentRowClassName={currentRowClass}
          len={trans().length}
          solution={trans()}
        />
        <Keyboard
          onChar={onChar}
          onDelete={onDelete}
          onEnter={onEnter}
          guesses={guesses}
          isRevealing={isRevealing}
          solution={solution}
        />
      </div>
      <InfoModal
        isOpen={isInfoModalOpen}
        handleClose={() => setIsInfoModalOpen(false)}
      />
      <StatsModal
        isOpen={isStatsModalOpen}
        handleClose={() => setIsStatsModalOpen(false)}
        guesses={guesses}
        gameStats={stats}
        isGameLost={isGameLost}
        isGameWon={isGameWon}
        solution={solution}
        handleShareToClipboard={() => showSuccessAlert(GAME_COPIED_MESSAGE)}
        numberOfGuessesMade={guesses.length}
      />
      <AlertContainer />
    </div>
  )
}
