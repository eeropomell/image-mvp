import io from "socket.io-client"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {Main} from "./pages/main"
import {Game} from "./pages/game"
import {Results} from "./pages/results"
import { createContext } from "react";
import { useState } from "react";

// Create a new context
export const NicknameContext = createContext();
export const RoomContext = createContext()

// Create a provider component
export const NicknameProvider = ({ children }) => {
  const [nickname_GLOBAL, setNickname_GLOBAL] = useState('');

  return (
    <NicknameContext.Provider value={{ nickname_GLOBAL, setNickname_GLOBAL }}>
      {children}
    </NicknameContext.Provider>
  );
};

export const RoomProvider = ({ children }) => {
  const [room,setRoom] = useState('');

  return (
    <RoomContext.Provider value={{ room, setRoom }}>
      {children}
    </RoomContext.Provider>
  );
};

function App() {

  return (
    <div className="App">
      <Router>
        <NicknameProvider>
          <RoomProvider>
          <Routes>
            <Route path="/" element={<Main/>}/>
            <Route path="/game" element={<Game/>}/>
            <Route path="/results" element={<Results/>}/>
          </Routes>
          </RoomProvider>
        </NicknameProvider>
        
      </Router>
    </div>
  );
}

export default App;
