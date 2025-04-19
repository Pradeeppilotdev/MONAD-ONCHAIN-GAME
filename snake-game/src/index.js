import React from 'react';
import ReactDOM from 'react-dom';
import { WagmiConfig } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config, chains } from './blockchain';
import '@rainbow-me/rainbowkit/styles.css';

const App = () => {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider chains={chains}>
        <div id="app">
          {/* Your existing game content will be rendered here */}
        </div>
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

ReactDOM.render(<App />, document.getElementById('root')); 