import React from 'react';
import './App.css';

const items = [1,2,3];
const fighters = ["John Elway", "Homer Simpson", "Ralph Sampson"]
const fighters2 = ["Buddy Guy", "Phillip Fry", "Eren Yeager"]

interface RowLabelsProps {
  label: string[];
}

const Cell = () => {
  return (
    <div className="cell">
    </div>
  )
}

const Row = () => {
  return (
    <div className="row">
      {items.map((item,index) => (
        <Cell key={item} />
      ))}
    </div>
  )
}

const ColLabels = () => {
  return (
    <div className="row">
      {fighters.map((fighter, index) => (
        <div className="col-label">{fighter}</div>
      ))}
    </div>
  )
}

const RowLabels = (props: RowLabelsProps) => {
  return (
    <>
      <div style={{display: "flex", flexDirection: "column"}}>
        {props.label.map((fighter, index) => (
          <div className="row-label">{fighter}</div>
        ))}
      </div>
    </>
  )
}

const Grid = () => {
  return (
      <div className="play-area">
        <ColLabels />
        <div className="play-area-lower">
          <RowLabels label={fighters2} />
          <div className="grid">
            {fighters2.map((fighter,index) => (
                <Row key={index} />
            ))}
          </div>
          <div className="row-label" />
        </div>
      </div>
  )
}

function App() {
  return (
    <>
      <div className="play-container">
        <Grid />
      </div>
    </>
  )
}

export default App;
