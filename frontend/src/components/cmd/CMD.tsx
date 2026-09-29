'use client';
import React, { useEffect, useRef, useState } from 'react';
import { CommandOutputs, commandOutputs } from './commands';
import Banner from './Banner';
import { getAutocompleteSuggestions } from './utils';

const CMD: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [currentPath, setCurrentPath] = useState<string[]>(['']);
  const [output, setOutput] = useState<any[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const meString = localStorage.getItem('rcaappuser');
  const me = meString ? JSON.parse(meString) : null;

  useEffect(() => {
    const suggestions = getAutocompleteSuggestions('', currentPath);
  }, [currentPath]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(inputValue.trim());
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        setHistoryIndex(historyIndex + 1);
        setInputValue(commandHistory[historyIndex + 1]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        setHistoryIndex(historyIndex - 1);
        setInputValue(commandHistory[historyIndex - 1] || '');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleTabPress();
    }
  };

  const handleTabPress = () => {
    const words = inputValue.split(' ');
    const currentWord = words[words.length - 1];
    const suggestions = getAutocompleteSuggestions(currentWord, currentPath);
    if (suggestions.length === 1) {
      const updatedInputValue = words[0] + ' ' + suggestions[0];
      setInputValue(updatedInputValue);
    } else if (suggestions.length > 1) {
      console.log('No suggestions');
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleCommand = async (command: string) => {
    if (!command.trim()) return;
    setCommandHistory([command, ...commandHistory]);
    setHistoryIndex(-1);

    setIsLoading(true);

    inputRef?.current?.blur();
    if (inputRef?.current) {
      inputRef.current.disabled = true;
    }

    const match = command.match(/^(\w+)(?:\s+(.*))?$/);
    const action = match ? match[1] : '';
    const args = match && match[2] ? match[2] : '';
    const params = { setOutput, args, me, currentPath, setCurrentPath, command, action };
    if (commandOutputs[action as keyof CommandOutputs]) {
      const result = await commandOutputs[action as keyof CommandOutputs](params);
      if (result) {
        setOutput([...output, result]);
      }
    } else {
      const newOut = (
        <div>
          <p>
            <span className="text-mainPurple font-bold">
              {' '}
              rca@{me ? me.username : ' '}
              {': '}
            </span>
            <span className="text-[#0357BD78] font-bold">
              {currentPath.join('/')}
              {' $'}
            </span>{' '}
            {command}
          </p>
          <p className="text-red-500">"{action}" command not found </p>
        </div>
      );
      setOutput([...output, newOut]);
    }
    setIsLoading(false);
    setInputValue('');
    if (inputRef?.current) {
      inputRef.current.disabled = false;
    }
    inputRef.current?.focus();
  };

  return (
    <div className="p-2 h-[95vh] overflow-y-auto overflow-x-hidden" ref={containerRef}>
      {/* Welcome message */}
      <p className=" italic text-sm font-semibold">
        Welcome to ESG Terminal. Type 'man' to see available commands
      </p>
      <div>
        {output.map((line: any, index: number) => (
          <div key={index}>{line}</div>
        ))}
      </div>
      <div className="flex items-start w-full ">
        <p className="text-mainPurple font-bold">
          {' '}
          rca@{me ? me.username : ' '}
          {': '}
          <span className="text-[#0357BD78] font-bold">
            {currentPath.join('/')}
            {' $'}
          </span>
        </p>
        <input
          type="text"
          className="bg-[#F5FAF7]  pl-1 flex-grow"
          ref={inputRef}
          value={inputValue}
          style={{ whiteSpace: 'pre-wrap', display: 'block' }}
          autoFocus
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {isLoading && <div className="loader text-sm italic">Loading</div>}
    </div>
  );
};

export default CMD;
