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
  <ContactCard context={context} actions={actions} />
));

// Static sample content, matching the Claude-Design HubSpot Cards mockup (Dana
// Ferris / Meridian Health Systems). Replace with live data once Atlas exposes
// a public API for HubSpot to call via hubspot.fetch().
const LINKED_ITEMS = [
  { name: 'Vendor contract renewal overdue', tag: 'CRITICAL' },
  { name: 'EHR Modernization RFP', tag: '$2.8M' },
];

const ContactCard = ({ actions }: CrmExtensionProps) => {
  return (
    <Flex direction="column" gap="medium">
      <Flex direction="row" justify="between" align="center">
        <Heading>Atlas Intelligence</Heading>
        <Text variant="microcopy">Synced 12m ago</Text>
      </Flex>

      <Flex direction="column" gap="extra-small">
        <Text format={{ fontWeight: 'bold' }}>ROLE IN KNOWLEDGE GRAPH</Text>
        <Text>
          Finance decision-maker on the Northgate vendor renewal and EHR
          Modernization RFP.
        </Text>
      </Flex>

      <Divider />

      <Flex direction="column" gap="extra-small">
        <Text format={{ fontWeight: 'bold' }}>
          LINKED RISKS &amp; OPPORTUNITIES
        </Text>
        {LINKED_ITEMS.map((item) => (
          <Flex key={item.name} direction="row" justify="between">
            <Text>{item.name}</Text>
            <Text format={{ fontWeight: 'bold' }}>{item.tag}</Text>
          </Flex>
        ))}
      </Flex>

      <Divider />

      <Flex direction="column" gap="extra-small">
        <Text format={{ fontWeight: 'bold' }}>LAST ACTIVITY</Text>
        <Text>Replied on Northgate renewal thread &middot; 12m ago</Text>
      </Flex>

      <Flex direction="row" gap="small">
        <Link href="https://atlas.sagesure.io">Open in Atlas</Link>
        <Button
          variant="secondary"
          onClick={() =>
            actions.addAlert({
              type: 'info',
              message: 'Timeline logging is not wired up yet in this build.',
            })
          }
        >
          Log to Timeline
        </Button>
      </Flex>
    </Flex>
  );
};
