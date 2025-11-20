import React, { createContext, useContext, useState } from "react";

const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  const [soundOn, setSoundOn] = useState(true);

  const toggleSound = () => setSoundOn((prev) => !prev);

  return (
    <SoundContext.Provider value={{ soundOn, toggleSound }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
