import * as React from 'react';
import * as _ from 'lodash';

import DashboardCard from '@console/shared/src/components/dashboard/dashboard-card/DashboardCard';
import DashboardCardBody from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardBody';
import DashboardCardHeader from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardHeader';
import DashboardCardTitle from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardTitle';
import ResourceQuotaBody from '@console/shared/src/components/dashboard/resource-quota-card/ResourceQuotaBody';
import {
  getQuotaResourceTypes,
  hasComputeResources,
  QuotaGaugeCharts,
  ResourceUsageRow,
} from '@console/internal/components/cluster-resource-quota';
import { FirehoseResult } from '@console/internal/components/utils';
import { ClusterResourceQuotaModel } from '@console/internal/models';
import {
  withDashboardResources,
  DashboardItemProps,
} from '@console/internal/components/dashboard/with-dashboard-resources';
import { SnsDashboardContext } from './dashboards/sns-dashboard-context';
import { referenceForModel } from '@console/internal/module/k8s';

const getResourceQuota = (quotaname: string) => ({
  kind: referenceForModel(ClusterResourceQuotaModel),
  namespaced: false,
  name: quotaname,
  isList: false,
  prop: 'clusterResourceQuota',
});

export const ResourceQuotaCard = withDashboardResources(
  ({ watchK8sResource, stopWatchK8sResource, resources }: DashboardItemProps) => {
    const { obj } = React.useContext(SnsDashboardContext);
    React.useEffect(() => {
      const clusterResourceQuota = getResourceQuota(obj.metadata.name);
      watchK8sResource(clusterResourceQuota);
      return () => stopWatchK8sResource(clusterResourceQuota);
    }, [obj.metadata.name, watchK8sResource, stopWatchK8sResource]);
    // console.log(resources.clusterResourceQuota)
    const quotas = resources.clusterResourceQuota
      ? (_.get(resources.clusterResourceQuota, 'data') as FirehoseResult['data'])
      : [];
    const loaded = _.get(resources.clusterResourceQuota, 'loaded');
    const error = _.get(resources.clusterResourceQuota, 'loadError');
    const resourceTypes = getQuotaResourceTypes(quotas);
    const showChartRow = hasComputeResources(resourceTypes);
    return (
      <DashboardCard data-test-id="resource-quotas-card">
        <DashboardCardHeader>
          <DashboardCardTitle>Cluster Resource Quotas</DashboardCardTitle>
        </DashboardCardHeader>
        <DashboardCardBody>
          <ResourceQuotaBody error={!!error} isLoading={!loaded}>
            {showChartRow && <QuotaGaugeCharts quota={quotas} resourceTypes={resourceTypes} />}
          </ResourceQuotaBody>
          <div className="co-m-table-grid co-m-table-grid--bordered">
            <div className="row co-m-table-grid__head">
              <div className="col-sm-4 col-xs-6">Resource Type</div>
              <div className="col-sm-2 hidden-xs">Capacity</div>
              <div className="col-sm-3 col-xs-3">Used</div>
              <div className="col-sm-3 col-xs-3">Max</div>
            </div>
            <div className="co-m-table-grid__body">
              {resourceTypes.map((type) => (
                <ResourceUsageRow key={type} quota={quotas} resourceType={type} />
              ))}
            </div>
          </div>
        </DashboardCardBody>
      </DashboardCard>
    );
  },
);
