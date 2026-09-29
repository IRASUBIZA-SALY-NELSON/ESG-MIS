import { Role } from '@/types/base.type';
import { getRoleRoutes } from '@/utils/funcs';
import { rem } from '@mantine/core';
import { Spotlight, SpotlightActionData, SpotlightActionGroupData } from '@mantine/spotlight';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next13-progressbar';
import { FiSearch } from 'react-icons/fi';

export default function MainSpotLight() {
  const router = useRouter();
  const role = getCookie('role');
  const routes = getRoleRoutes(role as Role);

  const actions: (SpotlightActionGroupData | SpotlightActionData)[] = [
    {
      group: 'Pages',
      actions: [
        {
          id: 'home',
          label: 'Home page',
          description: 'Where we started',
          onClick: () => router.push('/'),
        },
        ...routes.map((route) => ({
          id: route.name,
          label: route.name,
          description: `Go to ${route.name} page`,
          onClick: () => router.push(route.path),
        })),
      ],
    },
  ];

  return (
    <>
      {/* <Button onClick={spotlight.open}>Open spotlight</Button> */}
      <Spotlight
        actions={actions}
        nothingFound="Nothing found..."
        highlightQuery
        shortcut={['Ctrl+K', 'mod + K']}
        limit={7}
        // maxHeight={400}
        searchProps={{
          leftSection: <FiSearch style={{ width: rem(20), height: rem(20) }} />,
          placeholder: 'Search...',
        }}
      />
    </>
  );
}
