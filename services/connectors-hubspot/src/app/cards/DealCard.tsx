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
  <DealCard context={context} actions={actions} />
));

// Static sample content, matching the Claude-Design HubSpot Cards mockup (EHR
// Modernization RFP / Meridian Health Systems). Replace with live data once
// Atlas exposes a public API for HubSpot to call via hubspot.fetch().
const DealCard = ({ actions }: CrmExtensionProps) => {
  return (
    <Flex direction="column" gap="medium">
      <Flex direction="row" justify="between" align="center">
        <Heading>Atlas Intelligence</Heading>
        <Text variant="microcopy">Synced 4m ago</Text>
      </Flex>

      <Text format={{ fontWeight: 'bold' }}>STAGE: PROPOSAL</Text>

      <Divider />

      <Flex direction="row" gap="medium">
        <Flex direction="column" gap="flush">
          <Text variant="microcopy">DEAL VALUE</Text>
          <Text format={{ fontWeight: 'bold' }}>$2.8M</Text>
        </Flex>
        <Flex direction="column" gap="flush">
          <Text variant="microcopy">WIN PROPENSITY</Text>
          <Text format={{ fontWeight: 'bold' }}>High</Text>
        </Flex>
      </Flex>

      <Divider />

      <Flex direction="column" gap="extra-small">
        <Text format={{ fontWeight: 'bold' }}>ATLAS RECOMMENDATION</Text>
        <Text>
          RFP scope matches two prior wins in this vertical -- high propensity
          to convert. Owen Mackey (CIO) is the internal sponsor.
        </Text>
      </Flex>

      <Flex direction="row" gap="small">
        <Link href="https://atlas.sagesure.io">Open in Atlas</Link>
        <Button
          variant="secondary"
          onClick={() =>
            actions.addAlert({
              type: 'info',
              message:
                'Similar-deals lookup is not wired up yet in this build.',
            })
          }
        >
          View Similar Deals
        </Button>
      </Flex>
    </Flex>
  );
};
