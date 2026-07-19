import {
  Button,
  CrmContext,
  Divider,
  ExtensionPointApiActions,
  Flex,
  Heading,
  Link,
  Text,
} from '@hubspot/ui-extensions';
import { hubspot } from '@hubspot/ui-extensions';

interface CrmExtensionProps {
  context: CrmContext;
  actions: ExtensionPointApiActions<'crm.record.tab'>;
}

hubspot.extend<'crm.record.tab'>(({ context, actions }: CrmExtensionProps) => (
  <CompanyCard context={context} actions={actions} />
));

// Static sample content, matching the Claude-Design HubSpot Cards mockup
// (Meridian Health Systems). Once Atlas exposes a public API for HubSpot to
// call, replace this with hubspot.fetch() against a permitted Atlas URL.
const STATS = [
  { label: 'OPEN RISKS', value: '3' },
  { label: 'OPPORTUNITIES', value: '2' },
  { label: 'ACTIVE PROJECTS', value: '5' },
  { label: 'LAST FILING', value: '6d ago' },
];

const CompanyCard = ({ actions }: CrmExtensionProps) => {
  return (
    <Flex direction="column" gap="medium">
      <Flex direction="row" justify="between" align="center">
        <Heading>Atlas Intelligence</Heading>
        <Text variant="microcopy">Synced 2m ago</Text>
      </Flex>

      <Flex direction="row" gap="small" align="center">
        <Text format={{ fontWeight: 'bold' }}>ELEVATED RISK</Text>
        <Text>Exposure score 71</Text>
      </Flex>

      <Divider />

      <Flex direction="row" wrap="wrap" gap="medium">
        {STATS.map((s) => (
          <Flex key={s.label} direction="column" gap="flush">
            <Text variant="microcopy">{s.label}</Text>
            <Text format={{ fontWeight: 'bold' }}>{s.value}</Text>
          </Flex>
        ))}
      </Flex>

      <Divider />

      <Flex direction="column" gap="extra-small">
        <Text format={{ fontWeight: 'bold' }}>ATLAS RECOMMENDATION</Text>
        <Text>
          Vendor contract lapse plus a compliance flag increases churn risk on
          the Northgate relationship this quarter.
        </Text>
      </Flex>

      <Flex direction="row" gap="small">
        <Link href="https://atlas.sagesure.io">Open in Atlas</Link>
        <Button
          variant="secondary"
          onClick={() =>
            actions.addAlert({
              type: 'info',
              message: 'Report generation is not wired up yet in this build.',
            })
          }
        >
          Generate Report
        </Button>
      </Flex>
    </Flex>
  );
};
