import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Admin() {
  const [question, setQuestion] = useState('');
  const [optiona, setOptionA] = useState('');
  const [optionb, setOptionB] = useState('');
  const [poll, setPoll] = useState(null);
  const [message, setMessage] = useState('');
  const [results, setResults] = useState({ A: 0, B: 0 });

  useEffect(() => {
    const fetchActivePoll = async () => {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('active', true)
        .single();

      if (error) {
        console.error('Error fetching poll:', error);
      } else {
        setPoll(data);
        if (data) {
          fetchResults(data.id);
        }
      }
    };
    fetchActivePoll();
  }, []);

  const fetchResults = async (pollId) => {
    const { data, error } = await supabase
      .from('votes')
      .select('choice')
      .eq('poll_id', pollId);

    if (error) {
      console.error('Error fetching results:', error);
    } else {
      let countA = 0;
      let countB = 0;

      data.forEach((vote) => {
        if (vote.choice === 'A') {
          countA++;
        } else if (vote.choice === 'B') {
          countB++;
        }
      });

      const results = { A: countA, B: countB };
      setResults(results);
    }
  };

  const startPoll = async () => {
    if (poll) {
      setMessage('현재 진행 중인 투표가 있습니다.');
      return;
    }

    const { data, error } = await supabase
      .from('polls')
      .insert({ question, optiona, optionb, active: true })
      .single();

    if (error) {
      console.error('Error starting poll:', error);
    } else {
      setPoll(data);
      setMessage('투표가 시작되었습니다.');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const endPoll = async () => {
    if (!poll) {
      setMessage('진행 중인 투표가 없습니다.');
      return;
    }

    const { data, error } = await supabase
      .from('polls')
      .update({ active: false })
      .eq('id', poll.id);

    if (error) {
      console.error('Error ending poll:', error);
    } else {
      setPoll(null);
      setMessage('투표가 종료되었습니다.');
      setResults({ A: 0, B: 0 }); // 투표가 종료될 때 결과 초기화
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100'>
      <div className='w-full max-w-md p-6 space-y-4 bg-white rounded-lg shadow-md'>
        <h1 className='text-2xl font-bold text-center text-gray-800'>
          투표 결과 확인 페이지
        </h1>
        {poll ? (
          <div className='space-y-4'>
            <div>
              <button
                className='w-full px-4 py-2 text-white transition duration-300 bg-blue-500 rounded hover:bg-blue-600'
                onClick={() => window.location.reload()}
              >
                투표 중간 집계
              </button>
            </div>
            <div className='space-y-2'>
              <h3 className='text-lg font-medium text-gray-600'>투표 결과: </h3>
              <p className='text-gray-600'>
                {poll.optiona}: {results.A}표
              </p>
              <p className='text-gray-600'>
                {poll.optionb}: {results.B}표
              </p>
              <h3 className='text-lg font-medium text-gray-600'>
                우승:{' '}
                {results.A > results.B
                  ? poll.optiona
                  : results.A < results.B
                  ? poll.optionb
                  : '동점'}
              </h3>
            </div>
            <button
              className='w-full px-4 py-2 text-white transition duration-300 bg-red-500 rounded hover:bg-red-600'
              onClick={endPoll}
            >
              투표 종료
            </button>
          </div>
        ) : (
          <div className='space-y-4'>
            <input
              type='text'
              placeholder='팀 A를 입력하세요'
              value={optiona}
              onChange={(e) => setOptionA(e.target.value)}
              className='w-full p-2 border border-gray-300 rounded'
            />
            <input
              type='text'
              placeholder='팀 B를 입력하세요'
              value={optionb}
              onChange={(e) => setOptionB(e.target.value)}
              className='w-full p-2 border border-gray-300 rounded'
            />
            <button
              className='w-full px-4 py-2 text-white transition duration-300 bg-blue-500 rounded hover:bg-blue-600'
              onClick={startPoll}
            >
              투표 시작
            </button>
          </div>
        )}
        <p className='text-center text-red-500'>{message}</p>
      </div>
    </div>
  );
}
