import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { Link } from 'react-router-dom';
import { FAKE_BAYC_ADDRESS } from '../contracts/addresses';
import { FAKE_BAYC_ABI } from '../contracts/abis';

function FakeBayc() {
  const [name, setName] = useState('');
  const [totalTokens, setTotalTokens] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new BrowserProvider(window.ethereum);
        const contract = new Contract(FAKE_BAYC_ADDRESS, FAKE_BAYC_ABI, provider);
        
        try {
          const tokenName = await contract.name();
          const tokenCount = await contract.tokenCounter();
          
          setName(tokenName);
          setTotalTokens(Number(tokenCount));
        } catch (error) {
          setError('Error loading collection data');
          console.error('Error:', error);
        }
      }
    };

    init();
  }, []);

  const claimToken = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setLoading(true);
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new Contract(FAKE_BAYC_ADDRESS, FAKE_BAYC_ABI, signer);
        
        const tx = await contract.claimAToken();
        await tx.wait();
        
        const newTotal = await contract.tokenCounter();
        setTotalTokens(Number(newTotal));
      } catch (error) {
        setError('Error claiming token');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="collection-container">
      <div className="collection-header">
        <div>
          <h1>{name}</h1>
          <p>Total Tokens: {totalTokens}</p>
        </div>
        <button 
          onClick={claimToken} 
          disabled={loading}
          className="claim-button"
        >
          {loading ? 'Claiming...' : 'Claim Token'}
        </button>
      </div>
      
      <div className="token-grid">
        {[...Array(totalTokens)].map((_, index) => (
          <Link 
            to={`/fakeBayc/${index}`} 
            key={index}
            className="token-card"
          >
            <h3>Token #{index}</h3>
            <p>Click to view details</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default FakeBayc; 