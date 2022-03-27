import './App.css'
import logo from './logo.png'
import { useState, useEffect } from 'react'
import { AlertContainer } from './components/alerts/AlertContainer'
import { Checkbox } from './components/form/Checkbox'
import { useAlert } from './context/AlertContext'
import { Navbar } from './components/navbar/Navbar'
import { Game } from './Game'
import { solution, solutionIndex } from './lib/words'
import {
  WORDS,
  CHINESE_WORDS,
  SPANISH_WORDS,
  DEFINITIONS,
  CHINESE_DEFINITIONS,
  SPANISH_DEFINITIONS,
} from './constants/wordlist'

function App() {
  //deleted navbar pls add on later!
  const [beginGame, setBeginGame] = useState(false)
  const [isCheckedEng, setIsCheckedEng] = useState(false)
  const handleChangeEng = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCheckedEng(e.target.checked)
  }

  const [isCheckedCh, setIsCheckedCh] = useState(false)
  const handleChangeCh = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCheckedCh(e.target.checked)
  }

  const [isCheckedSp, setIsCheckedSp] = useState(false)
  const handleChangeSp = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCheckedSp(e.target.checked)
  }
  const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
    // Preventing the page from reloading
    event.preventDefault()
    setBeginGame(true)
  }

  return (
    <div className="h-screen flex flex-col">
      <img className="logo" src={logo} alt="Logo" />
      <div className="languagesform">
        <form onSubmit={submitForm}>
          <h1 font-weight="bold">Select your languages for Codle!</h1>
          {/* ------------------------------------------------ */}
          <div className="checkbox">
            <Checkbox
              handleChange={handleChangeEng}
              isChecked={isCheckedEng}
              label="English"
            />
          </div>
          <div className="checkbox">
            <Checkbox
              handleChange={handleChangeCh}
              isChecked={isCheckedCh}
              label="Chinese Pinyin"
            />
          </div>
          <div className="checkbox">
            <Checkbox
              handleChange={handleChangeSp}
              isChecked={isCheckedSp}
              label="Spanish"
            />
          </div>
          <button
            type="submit"
            className="bg-white hover:bg-gray-100 text-green-400 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
          >
            Done
          </button>
        </form>
      </div>
      <div className="h-screen flex-col">
        <div className="float-container">
          <div className="float-child">
            <div>
              {isCheckedEng && beginGame && (
                <Game
                  language="English"
                  solution={solution}
                  definition={DEFINITIONS[solutionIndex % WORDS.length]}
                />
              )}
            </div>
          </div>
          <div className="float-child">
            <div>
              {isCheckedCh && beginGame && (
                <Game
                  language="Chinese Pinyin"
                  solution={CHINESE_WORDS[solutionIndex % CHINESE_WORDS.length]}
                  definition={
                    CHINESE_DEFINITIONS[solutionIndex % CHINESE_WORDS.length]
                  }
                />
              )}
            </div>
          </div>
          <div className="float-child">
            <div>
              {isCheckedSp && beginGame && (
                <Game
                  language="Spanish"
                  solution={SPANISH_WORDS[solutionIndex % SPANISH_WORDS.length]}
                  definition={
                    SPANISH_DEFINITIONS[solutionIndex % SPANISH_WORDS.length]
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
