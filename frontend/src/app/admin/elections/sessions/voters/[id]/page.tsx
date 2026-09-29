import SessionVoters from '@/components/Elections/shared-pages/SessionVoters';

interface Props {
  params: { id: string };
}

const VotersIndex = (props: Props) => {
  return <SessionVoters sessionId={String(props.params.id)} />;
};

export default VotersIndex;
