import ProfileClient from './ProfileClient';

interface PageProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: PageProps) {
  return <ProfileClient id={params.id} />;
} 