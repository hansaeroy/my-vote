import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Head from 'next/head';

export default function Home() {
  const [poll, setPoll] = useState(null);
  const [vote, setVote] = useState('');
  const [message, setMessage] = useState('');

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
      }
    };
    fetchActivePoll();
  }, []);

  const handleVote = async (choice) => {
    if (vote) {
      setMessage('투표를 완료하였습니다.');
      return;
    }

    const { error } = await supabase
      .from('votes')
      .insert({ poll_id: poll.id, choice });

    if (error) {
      console.error('Error submitting vote:', error);
    } else {
      setVote(choice);
      setMessage('투표를 완료하였습니다.');
    }
  };

  if (!poll) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-100'>
        <Head>
          <title>불후의 명곡 투표</title>
          <meta name='description' content='복음중앙교회 불후의 명곡' />
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <link rel='icon' href='/favicon.ico' />
        </Head>
        <div className='p-6 text-center bg-white rounded-lg shadow-md'>
          <p className='text-lg text-gray-700'>진행 중인 투표가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>불후의 명곡 투표</title>
        <meta name='description' content='복음중앙교회 불후의 명곡' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100'>
        <div className='w-full max-w-md p-6 space-y-4 bg-white rounded-lg shadow-md'>
          {vote ? (
            ''
          ) : (
            <h1 className='py-2 text-2xl font-bold text-center text-gray-800'>
              팀을 선택해 주세요
            </h1>
          )}
          {vote ? (
            <p className='text-3xl text-center '>투표를 완료하였습니다</p>
          ) : (
            <div className='flex justify-between space-x-4'>
              <button
                onClick={() => handleVote('A')}
                className='w-1/2 px-4 py-48 text-4xl text-white transition duration-300 bg-blue-500 rounded hover:bg-blue-600'
              >
                {poll.optiona}
              </button>
              <button
                onClick={() => handleVote('B')}
                className='w-1/2 px-4 py-48 text-4xl text-white transition duration-300 bg-green-500 rounded hover:bg-green-600'
              >
                {poll.optionb}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
