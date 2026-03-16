'use client';

import { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AIPredictor({ priceHistory }) {
  const [predictionData, setPredictionData] = useState([]);
  const [learningInfo, setLearningInfo] = useState({ state: 'idle', loss: 0 });

  useEffect(() => {
    async function runPrediction() {
      // Need enough points
      if (!priceHistory || priceHistory.length < 3) return;
      
      setLearningInfo({ state: 'training', loss: 0 });
      
      try {
        await tf.ready();
        
        const xs = [];
        const ys = [];
        
        priceHistory.forEach((item, index) => {
          xs.push(index);
          ys.push(Number(item.price));
        });
        
        const tensorX = tf.tensor2d(xs, [xs.length, 1]);
        const tensorY = tf.tensor2d(ys, [ys.length, 1]);
        
        const model = tf.sequential();
        model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
        
        model.compile({ 
          loss: 'meanSquaredError', 
          optimizer: tf.train.adam(0.1) 
        });
        
        await model.fit(tensorX, tensorY, {
          epochs: 100,
          callbacks: {
            onEpochEnd: (epoch, logs) => {
              if (epoch === 99) {
                setLearningInfo({ state: 'done', loss: logs.loss });
              }
            }
          }
        });
        
        const futurePoints = 3;
        const predictXs = [];
        for (let i = 0; i < xs.length + futurePoints; i++) {
          predictXs.push(i);
        }
        
        const tensorPredictX = tf.tensor2d(predictXs, [predictXs.length, 1]);
        const tensorPreds = model.predict(tensorPredictX);
        const predsBytes = await tensorPreds.data();
        
        const newChartData = [];
        for (let i = 0; i < predictXs.length; i++) {
          newChartData.push({
            time: i < xs.length ? priceHistory[i].time : `Future ${i + 1}`,
            actual: i < xs.length ? priceHistory[i].price : null,
            predicted: predsBytes[i]
          });
        }
        
        setPredictionData(newChartData);
        
        tensorX.dispose();
        tensorY.dispose();
        tensorPredictX.dispose();
        tensorPreds.dispose();
        model.dispose();
      } catch (err) {
        console.error('TFJS Error:', err);
        setLearningInfo({ state: 'error', loss: 0 });
      }
    }
    
    runPrediction();
  }, [priceHistory]);

  if (!priceHistory || priceHistory.length < 3) {
    return (
      <div className="analytics-card" style={{ marginTop: '20px', gridColumn: '1 / -1' }}>
        <h3>🤖 AI-Predicted Price</h3>
        <p className="analytics-desc">Need at least 3 trades for ML inference. Please make more swaps or wait for events.</p>
      </div>
    );
  }

  return (
    <div className="analytics-card" style={{ marginTop: '20px', gridColumn: '1 / -1' }}>
      <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div>
          <h3>🤖 AI-Predicted Price</h3>
          <p className="analytics-desc">Simple dynamic inference on recent trades via TensorFlow.js</p>
        </div>
        <div>
          {learningInfo.state === 'training' && <span className="loading-badge">Training Model...</span>}
          {learningInfo.state === 'done' && <span className="event-badge">MSE: {learningInfo.loss.toFixed(6)}</span>}
          {learningInfo.state === 'error' && <span style={{ color: 'red' }}>Error making prediction</span>}
        </div>
      </div>
      
      <div style={{ width: '100%', height: 300 }}>
        {predictionData.length > 0 && (
          <ResponsiveContainer>
            <LineChart data={predictionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
              <XAxis dataKey="time" stroke="#9090a0" />
              <YAxis stroke="#9090a0" domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ background: '#12121a', border: '1px solid #2a2a3a', borderRadius: '8px' }}
                formatter={(value, name) => [`$${Number(value).toFixed(4)}`, name === 'actual' ? 'Actual Price' : 'Predicted Price']}
              />
              <Legend />
              <Line type="monotone" dataKey="actual" stroke="#6366f1" strokeWidth={2} dot={{r: 4}} activeDot={{r: 6}} name="Actual Price" connectNulls />
              <Line type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} name="AI Prediction" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
