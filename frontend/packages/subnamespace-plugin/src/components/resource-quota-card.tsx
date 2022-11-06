import * as React from 'react';
// import * as _ from 'lodash';

import DashboardCard from '@console/shared/src/components/dashboard/dashboard-card/DashboardCard';
import DashboardCardBody from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardBody';
import DashboardCardHeader from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardHeader';
import DashboardCardTitle from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardTitle';
import ResourceQuotaBody from '@console/shared/src/components/dashboard/resource-quota-card/ResourceQuotaBody';
import {
  // getCrqQuotaResourceTypes,
  // getRqQuotaResourceTypes,
  hasComputeResources,
  QuotaGaugeCharts,
  ResourceUsageRow,
} from '@console/internal/components/cluster-resource-quota';
// import { FirehoseResult, ResourceLink } from '@console/internal/components/utils';
import { ClusterResourceQuotaModel, ResourceQuotaModel } from '@console/internal/models';
// import {
//   withDashboardResources,
//   DashboardItemProps,
// } from '@console/internal/components/dashboard/with-dashboard-resources';
import { SnsDashboardContext } from './dashboards/sns-dashboard-context';
import { K8sResourceKind, referenceForModel } from '@console/internal/module/k8s';
import { useK8sWatchResource } from '@console/internal/components/utils/k8s-watch-hook';
// import {SnsChildernsTable} from "./dashboards/details-card";

const getClusterResourceQuota = (quotaname: string) => ({
  kind: referenceForModel(ClusterResourceQuotaModel),
  namespaced: false,
  name: quotaname,
  isList: false,
  prop: 'clusterResourceQuota',
});

const getResourceQuota = (quotaname: string) => ({
  kind: referenceForModel(ResourceQuotaModel),
  namespaced: false,
  name: quotaname,
  // namespace: quotaname,
  isList: false,
  prop: 'resourceQuota',
});
//
// export const ResourceQuotaCard = withDashboardResources(
//   ({ watchK8sResource, stopWatchK8sResource, resources }: DashboardItemProps) => {
//     const { obj } = React.useContext(SnsDashboardContext);
//     // React.useEffect(() => {
//     //   const quota = getClusterResourceQuota(obj.metadata.name);
//     //   // obj.metadata.labels['dana.hns.io/rq'] !== 'true'
//     //   //   ? getClusterResourceQuota(obj.metadata.name)
//     //   //   : getResourceQuota(obj.metadata.name);
//     //   // eslint-disable-next-line no-console
//     //   // console.log('1', quota);
//     //   // const clusterResourceQuota = getClusterResourceQuota(obj.metadata.name);
//     //   watchK8sResource(quota);
//     //   return () => stopWatchK8sResource(quota);
//     // }, [
//     //   obj.metadata.name,
//     //   watchK8sResource,
//     //   stopWatchK8sResource,
//     //   // obj.metadata.labels,
//     //   // obj.metadata.namespace,
//     // ]);
//     // // eslint-disable-next-line no-console
//     // // console.log('2', resources);
//     // // eslint-disable-next-line no-console
//     // // console.log('3', resources.quota);
//     // const quotas = resources.quota
//     //   ? (_.get(resources.quota, 'data') as FirehoseResult['data'])
//     //   : [];
//     // // eslint-disable-next-line no-console
//     // // console.log('4', quotas);
//     // const typer = _.get(quotas, 'kind');
//     // // eslint-disable-next-line no-console
//     // // console.log('5', typer);
//     // const loaded = _.get(resources.quota, 'loaded');
//     // const error = _.get(resources.quota, 'loadError');
//     // let resourceTypes;
//     //
//     // if (typer === 'ClusterResourceQuota') {
//     //   resourceTypes = getCrqQuotaResourceTypes(quotas);
//     // } else {
//     //   resourceTypes = getRqQuotaResourceTypes(quotas);
//     // }
//     // const showChartRow = hasComputeResources(resourceTypes);
//
//     return (
//       <DashboardCard data-test-id="resource-quotas-card">
//         <DashboardCardHeader>
//           <DashboardCardTitle>Cluster Resource Quotas</DashboardCardTitle>
//         </DashboardCardHeader>
//         <DashboardCardBody>
//           <ResourceQuotaBody error={!!error} isLoading={!loaded}>
//             {showChartRow && <QuotaGaugeCharts quota={quotas} resourceTypes={resourceTypes} />}
//           </ResourceQuotaBody>
//           <div className="co-m-table-grid co-m-table-grid--bordered">
//             <div className="row co-m-table-grid__head">
//               <div className="col-sm-4 col-xs-6">Resource Type</div>
//               <div className="col-sm-2 hidden-xs">Capacity</div>
//               <div className="col-sm-3 col-xs-3">Used</div>
//               <div className="col-sm-3 col-xs-3">Max</div>
//             </div>
//             <div className="co-m-table-grid__body">
//               {resourceTypes.map((type) => (
//                 <ResourceUsageRow key={type} quota={quotas} resourceType={type} />
//               ))}
//             </div>
//           </div>
//         </DashboardCardBody>
//       </DashboardCard>
//     );
//   },
// );

export const ResourceQuotaCard: React.FC = () => {
  const { obj } = React.useContext(SnsDashboardContext);
  let quotaProp;
  obj.metadata.labels['dana.hns.io/rq'] !== 'true'
    ? (quotaProp = getClusterResourceQuota(obj.metadata.name))
    : (quotaProp = getResourceQuota(obj.metadata.name));
  const [quota, loaded, error] = useK8sWatchResource<K8sResourceKind>(quotaProp);
  // eslint-disable-next-line no-console
  console.log(quotaProp, quota, loaded, error);
  const resourceTypes = [
    'requests.cpu',
    'cpu',
    'limits.cpu',
    'requests.memory',
    'memory',
    'limits.memory',
  ];
  const showChartRow = hasComputeResources(resourceTypes);

  return (
    <DashboardCard data-test-id="resource-quotas-card">
      <DashboardCardHeader>
        <DashboardCardTitle>Cluster Resource Quotas</DashboardCardTitle>
      </DashboardCardHeader>
      <DashboardCardBody>
        <ResourceQuotaBody error={!!error} isLoading={!loaded}>
          {showChartRow && <QuotaGaugeCharts quota={quota} resourceTypes={resourceTypes} />}
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
              <ResourceUsageRow key={type} quota={quota} resourceType={type} />
            ))}
          </div>
        </div>
      </DashboardCardBody>
    </DashboardCard>
  );
};
//
// const error = _.get(quotaProp, 'loadError');
// let resourceTypes = getRqQuotaResourceTypes(quota);
// const showChartRow = hasComputeResources(resourceTypes);
// // eslint-disable-next-line no-console
// console.log(quota, loaded, error, resourceTypes, showChartRow);
// // eslint-disable-next-line no-console
// console.log(3);
// let quotaProp = getClusterResourceQuota(obj.metadata.name);
// let quota = quotaProp ? (_.get(quotaProp, 'data') as FirehoseResult['data']) : [];
// const loaded = _.get(quotaProp, 'loaded');
// const error = _.get(quotaProp, 'loadError');
// const resourceTypes = getRqQuotaResourceTypes(quota);
// const showChartRow = hasComputeResources(resourceTypes);
// // eslint-disable-next-line no-console
// console.log(quota, loaded, error, resourceTypes, showChartRow);
