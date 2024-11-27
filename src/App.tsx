//========================================================================================================
// IMPORTS
//========================================================================================================

import { useState, useEffect } from 'react';

import { useDisclosure, useDebouncedCallback } from '@mantine/hooks';
import { MantineProvider, Modal, Autocomplete, Button } from '@mantine/core';
import '@mantine/core/styles.css';

import fighter_fights from './JSON/fighter_fights.json';
import fighter_id from './JSON/fighter_id_name_map.json';
import fighter_pics from './JSON/fighter_pics.json';

import './App.css';

//========================================================================================================
// INTERFACES
//========================================================================================================

interface FightData {
  [fighter: string]: string[]; 
}

interface FightIdMap {
  [key: string]: string;
}

interface ColLabelProps {
  label: string[];
}

interface RowLabelsProps {
  label: string[];
}

interface RowProps {
  cols: string[];
  rowNumber: number;
  answers: string[];
  answersCorrect: (boolean|null)[];
  onCellClick: (rowNumber: number, colNumber: number) => void;
}

interface CellProps {
  rowNumber: number;
  colNumber: number;
  answer: string;
  answerCorrect: boolean|null;
  onClick: (rowNumber: number, colNumber: number) => void;
}

interface FighterSelectModalProps {
  opened: boolean;
  onClose: () => void;
  rowFighter: string;
  colFighter: string;
  fighterSelected: (fighter: string) => void;
}

interface FighterDisplayProps {
  fighterId: string;
}

//========================================================================================================
// FUNCTIONS
//========================================================================================================

const fights: FightData = fighter_fights;
const fightId: FightIdMap = fighter_id;

const getRandomElement = (arr: string[]) => {
  return arr[Math.floor(Math.random() * arr.length)];
}

const getOpps = (fighter: string):string[] => {
  return fights[fighter];
}

const getOppsOfOpps = (fights: FightData, fighter: string): string[] => {
  const oppsOfOppsSet = new Set();

  const opps = getOpps(fighter);

  for (let opp of opps) {
    let hisOpps = getOpps(opp);
    hisOpps.forEach(opponent => oppsOfOppsSet.add(opponent));
  }

  return Array.from(oppsOfOppsSet) as string[];
}

const orderByNumFights = (fightData: FightData, fighters: string[]): string[] => {
  const fighterFightCounts: Record<string, number> = {};

  for (const fighter of fighters) {
    fighterFightCounts[fighter] = fightData[fighter].length;
  }

  const sortedFighters = Object.keys(fighterFightCounts)
    .sort((a, b) => fighterFightCounts[b] - fighterFightCounts[a]);

  return sortedFighters; 
}

const orderByLargestIntersection = (fighter: string, candidates: string[]): string[] => {
  const intersectCounts: Record<string, number> = {};

  for (const candidate of candidates) {
    intersectCounts[candidate] = getIntersection(fights[fighter], fights[candidate]).length;
  }

  const sortedCandidates = Object.keys(intersectCounts)
    .sort((a, b) => intersectCounts[b] - intersectCounts[a]);
  
  return sortedCandidates;
}

const getIntersection = (list1: string[], list2: string[]): string[] => {
  const intersection: string[] = []; 

  for (const fighter of list1) {
    if (list2.includes(fighter)) { intersection.push(fighter) }
  }

  return intersection;
}

const hasCommonOpp = (fighter1: string, fighter2: string):boolean => {
  const opponents1 = new Set(fights[fighter1]);
  const opponents2 = new Set(fights[fighter2]);

  for (const opponent in opponents1) {
    if (opponents2.has(opponent)) { return true; }
  }
  
  return false;
}

const didFight = (fighter1: string, fighter2: string) => {
  const opponents = new Set(fights[fighter1]);

  if (opponents.has(fighter2)) { return true; }

  return false;
}

/*
       3 x 3 grid

     A     B     C
  +-----+-----+-----+
D |     |     |     |
  +-----+-----+-----+
E |     |     |     |
  +-----+-----+-----+
F |     |     |     |
  +-----+-----+-----+
*/

const buildGrid = ():[string[], string[]] => {
  const columnFighters: string[] = [];
  const rowFighters: string[] = [];

  const filteredFights: FightData = Object.fromEntries(
    Object.entries(fights).filter(([fighter, opponents]) => opponents.length >= 10)
  );

  const A = getRandomElement(Object.keys(filteredFights));
  columnFighters.push(A);

  const aOppsOfOpps = getOppsOfOpps(fights, A);
  let rowIntersectionCandidates = orderByLargestIntersection(A, aOppsOfOpps);

  const D = rowIntersectionCandidates.find(candidate => !columnFighters.includes(candidate) && !rowFighters.includes(candidate)) || "";
  rowFighters.push(D);
  
  const E = rowIntersectionCandidates.find(candidate => !columnFighters.includes(candidate) && !rowFighters.includes(candidate)) || "";
  rowFighters.push(E);

  const dOppsOfOpps = getOppsOfOpps(fights, D);
  const eOppsOfOpps = getOppsOfOpps(fights, E);

  const bCandidates = orderByLargestIntersection(E, getIntersection(dOppsOfOpps, eOppsOfOpps));
  const B = bCandidates.find(candidate => !columnFighters.includes(candidate) && !rowFighters.includes(candidate)) || "";
  columnFighters.push(B);

  const bOppsOfOpps = getOppsOfOpps(fights, B);
  const fCandidates = orderByLargestIntersection(B, getIntersection(aOppsOfOpps, bOppsOfOpps));
  const F = fCandidates.find(candidate => !columnFighters.includes(candidate) && !rowFighters.includes(candidate)) || "";
  rowFighters.push(F);

  const fOppsOfOpps = getOppsOfOpps(fights, F);
  let cCandidates = getIntersection(dOppsOfOpps, getIntersection(eOppsOfOpps, fOppsOfOpps));
  cCandidates = orderByNumFights(fights, cCandidates);
  const C = cCandidates.find(candidate => !columnFighters.includes(candidate) && !rowFighters.includes(candidate)) || "";
  columnFighters.push(C);

  return [columnFighters, rowFighters]
}

//========================================================================================================
// SMALLER COMPONENTS
//========================================================================================================

const Cell = (props: CellProps) => {
  return (
    <div 
      className={`cell ${props.answerCorrect === true ? 'cell-correct' : props.answerCorrect === false ? 'cell-incorrect' : ''}`}
      onClick={() => props.onClick(props.rowNumber, props.colNumber)}
    >
      {props.answer !== "" && (
        <FighterDisplay fighterId={props.answer} />
      )}
    </div>
  )
}

const Row = (props: RowProps) => {
  return (
    <div className="row">
      {props.cols.map((item,index) => (
        <Cell 
          rowNumber={props.rowNumber} 
          colNumber={index} 
          onClick={props.onCellClick} 
          answer={props.answers[index]} 
          answerCorrect={props.answersCorrect[index]}
        />
      ))}
    </div>
  )
}

const ColLabels = (props: ColLabelProps) => {
  return (
    <div className="row">
      {props.label.map((fighter, index) => (
        <div className="col-label">
          <FighterDisplay fighterId={fighter} />
        </div>
      ))}
    </div>
  )
}

const RowLabels = (props: RowLabelsProps) => {
  return (
    <>
      <div style={{display: "flex", flexDirection: "column"}}>
        {props.label.map((fighter, index) => (
          <div className="row-label">
            <FighterDisplay fighterId={fighter} />
          </div>
        ))}
      </div>
    </>
  )
}

const FighterSelectModal = (props: FighterSelectModalProps) => {
  const [selectedFighter, setSelectedFighter] = useState<string>("");

  const debounceOnChange = useDebouncedCallback((value: string) => {
    const key = Object.keys(fightId).find(key => fightId[key] === value);
    if (key) {
      setSelectedFighter(key);
    }
  }, 300);

  const handleFighterSelected = () => {
    props.fighterSelected(selectedFighter);
  }

  const data = Object.values(fightId);

  return (
    <>
    <Modal opened={props.opened} onClose={props.onClose} centered>
      <div>
        Select a fighter who fought both {fightId[props.rowFighter]} and {fightId[props.colFighter]} in the UFC.
      </div>
      <Autocomplete
        label={""}
        placeholder="Search..."
        data={data}
        onChange={debounceOnChange}
        withScrollArea={false}
        styles={{ dropdown: { maxHeight: 200, overflowY: 'auto', cursor: 'pointer' } }}
        style={{ marginRight: '1em' }} 
      />
      <Button onClick={handleFighterSelected}>Submit</Button>
    </Modal>
    </>
  )
}

const FighterDisplay = (props: FighterDisplayProps) => {
  const imgURL = fighter_pics.find(f => f.Name === fightId[props.fighterId])?.PicURL

  return (
    <>
    <div className="fighter-display">
      <img 
        className="fighter-img"
        src={imgURL ? imgURL : 'https://dmxg5wxfqgb4u.cloudfront.net/styles/teaser/s3/image/fighter_images/ComingSoon/comingsoon_headshot_odopod.png?VersionId=6Lx8ImOpYf0wBYQKs_FGYIkuSIfTN0f0\u0026amp;itok=pYDOjN8k'} />
      {fightId[props.fighterId]}
    </div>
    </>
  )
}

const Grid = () => {
  const [columnFighters, setColumnFighters] = useState<string[]>([]);
  const [rowFighters, setRowFighters] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[][]>([["","",""],["","",""],["","",""]]);
  const [answersCorrect, setAnswersCorrect] = useState<(boolean | null)[][]>([[null,null,null],[null,null,null],[null,null,null]])
  const [activeCell, setActiveCell] = useState<number[]>([]);

  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    const fighters = buildGrid();
    setColumnFighters(fighters[0]);
    setRowFighters(fighters[1]);
    setAnswers([["","",""],["","",""],["","",""]]);
    setAnswersCorrect([[null,null,null],[null,null,null],[null,null,null]]);
    setActiveCell([]);
  },[])

  const handleCellClick = (rowNumber: number, colNumber: number) => {
    setActiveCell([rowNumber, colNumber])
    open();
  }

  const handleFighterSelected = (fighter: string) => {
    const row = activeCell[0];
    const col = activeCell[1]; 
    
    let newAnswers = answers;
    newAnswers[row][col] = fighter;
    setAnswers(newAnswers);

    let newAnswersCorrect: (boolean | null)[][] = [...answersCorrect];
    newAnswersCorrect[row][col] = (didFight(rowFighters[row], fighter) && didFight(columnFighters[col], fighter));
    setAnswersCorrect(newAnswersCorrect);

    close();
  }

  return (
    <>
    <MantineProvider>
      <FighterSelectModal 
        opened={opened} 
        onClose={close} 
        rowFighter={rowFighters[activeCell[0]]} 
        colFighter={columnFighters[activeCell[1]]} 
        fighterSelected={handleFighterSelected}
      />
      <div className="play-area">
        <ColLabels label={columnFighters} />
        <div className="play-area-lower">
          <RowLabels label={rowFighters} />
          <div className="grid">
            {rowFighters.map((fighter,index) => (
                <Row 
                  cols={columnFighters} 
                  key={index} 
                  rowNumber={index} 
                  onCellClick={handleCellClick} 
                  answers={answers[index]} 
                  answersCorrect={answersCorrect[index]}
                />
            ))}
          </div>
          <div className="row-label" />
        </div>
      </div>
    </MantineProvider>
    </>
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
