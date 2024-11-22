//========================================================================================================
// IMPORTS
//========================================================================================================

import { useState } from 'react';

import fighter_fights from '../JSON/fighter_fights.json';
import fighter_id from '../JSON/fighter_id_name_map.json';
import fighter_pics from '../JSON/fighter_pics.json';

import './App.css';

//========================================================================================================
// INTERFACES
//========================================================================================================

interface FightData {
  [fighter: string]: string[]; 
}

interface RowLabelsProps {
  label: string[];
}

//========================================================================================================
// FUNCTIONS
//========================================================================================================

const items = [1,2,3];
const fighters = ["John Elway", "Homer Simpson", "Ralph Sampson"]
const fighters2 = ["Buddy Guy", "Phillip Fry", "Eren Yeager"]

const fights: FightData = fighter_fights;

const getRandomElement = (arr: string[]) => {
  return arr[Math.floor(Math.random()) * arr.length];
}

const hasCommonOpp = (fighter1: string, fighter2: string):boolean => {
  const opponents1 = new Set(fights[fighter1]);
  const opponents2 = new Set(fights[fighter2]);

  for (const opponent in opponents1) {
    if (opponents2.has(opponent)) { return true; }
  }
  
  return false;
}

const fightersWhoFought = (opponent: string):string[] => {
  return fights[opponent];
}

const didFight = (fighter1: string, fighter2: string) => {
  const opponents = new Set(fights[fighter1]);

  if (opponents.has(fighter2)) { return true; }

  return false;
}

function pickTopFighters(fightData: FightData, fighters: string[]): string[] {
  const fighterFightCounts: Record<string, number> = {};

  for (const fighter of fighters) {
    fighterFightCounts[fighter] = fightData[fighter].length;
  }

  const sortedFighters = Object.keys(fighterFightCounts)
    .sort((a, b) => fighterFightCounts[b] - fighterFightCounts[a]);

  return sortedFighters.slice(0, 2); 
}

const buildGrid = () => {
  const columnFighters: string[] = [];
  const columnFightersSet = new Set();
  const rowFighters: string[] = [];
  const rowFightersSet = new Set();

  const filteredFights: FightData = Object.fromEntries(
    Object.entries(fights).filter(([fighter, opponents]) => opponents.length >= 10)
  );

  const opponent11 = getRandomElement(Object.keys(filteredFights));

  const fighters1 = pickTopFighters(fights, fightersWhoFought(opponent11));
  columnFighters.push(fighters1[0]);
  columnFightersSet.add(fighters1[0]);
  rowFighters.push(fighters1[1]);
  rowFightersSet.add(fighters1[1]);




}

//========================================================================================================
// SMALLER COMPONENTS
//========================================================================================================

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
  const [fightersTop, setFightersTop] = useState<string[]>([]);
  const [fightersSide, setFightersSide] = useState<string[]>([]);

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

//========================================================================================================
// MAINT COMPONENT & RENDER
//========================================================================================================

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
