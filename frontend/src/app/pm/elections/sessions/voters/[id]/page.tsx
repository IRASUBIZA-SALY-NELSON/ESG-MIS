import SessionVoters from '@/components/Elections/shared-pages/SessionVoters';
import { useParams } from 'next/navigation';
import React from 'react';

interface Props {
  params: { id: string };
}

const VotersIndex = (props: Props) => {
  return <SessionVoters sessionId={String(props.params.id)} canRelease />;
};

export default VotersIndex;
