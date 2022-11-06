import * as _ from 'lodash';
import * as React from 'react';
import * as classNames from 'classnames';
import { sortable } from '@patternfly/react-table';
import {
  OutlinedCircleIcon,
  ResourcesAlmostEmptyIcon,
  ResourcesAlmostFullIcon,
  ResourcesFullIcon,
  UnknownIcon,
} from '@patternfly/react-icons';

import { YellowExclamationTriangleIcon } from '@console/shared';
import { DetailsPage, ListPage, Table, TableRow, TableData } from './factory';
import {
  Kebab,
  SectionHeading,
  navFactory,
  // ResourceKebab,
  ResourceLink,
  // ResourceSummary,
  convertToBaseValue,
} from './utils';
// import { connectToFlags, flagPending } from '../reducers/features';
import { GaugeChart } from './graphs/gauge';
// import { LoadingBox } from './utils/status-box';
import { referenceForModel } from '../module/k8s';
import { ClusterResourceQuotaModel } from '../models';
import { getQuotaResourceTypes } from './resource-quota';

const ClusterResourceQuotaReference = referenceForModel(ClusterResourceQuotaModel);

//
// const { common } = Kebab.factory;
// const resourceQuotaMenuActions = [
//   ...Kebab.getExtensionsActionsForKind(ResourceQuotaModel),
//   ...common,
// ];
// const clusterResourceQuotaMenuActions = [
//   ...Kebab.getExtensionsActionsForKind(ClusterResourceQuotaModel),
//   ...common,
// ];

// const quotaActions = (quota) =>
//   quota.metadata.namespace ? resourceQuotaMenuActions : clusterResourceQuotaMenuActions;
const gaugeChartThresholds = [{ value: 90 }, { value: 101 }];

const quotaScopes = Object.freeze({
  Terminating: {
    label: 'Terminating',
    description:
      'Affects pods that have an active deadline. These pods usually include builds, deployers, and jobs.',
  },
  NotTerminating: {
    label: 'Not Terminating',
    description:
      'Affects pods that do not have an active deadline. These pods usually include your applications.',
  },
  BestEffort: {
    label: 'Best Effort',
    description:
      'Affects pods that do not have resource limits set. These pods have a best effort quality of service.',
  },
  NotBestEffort: {
    label: 'Not Best Effort',
    description:
      'Affects pods that have at least one resource limit set. These pods do not have a best effort quality of service.',
  },
});

export const getCrqQuotaResourceTypes = (quota) => {
  const specHard = _.get(quota, 'spec.quota.hard');
  return _.keys(specHard).sort();
};

export const getRqQuotaResourceTypes = (quota) => {
  const specHard = _.get(quota, 'spec.hard');
  return _.keys(specHard).sort();
};

const getResourceUsage = (quota, resourceType) => {
  const statusPath = ['status', 'total', 'hard'];
  const specPath = ['spec', 'quota', 'hard'];
  const usedPath = ['status', 'total', 'used'];
  const max =
    _.get(quota, [...statusPath, resourceType]) || _.get(quota, [...specPath, resourceType]);
  const used = _.get(quota, [...usedPath, resourceType]);
  const percent = !max || !used ? 0 : (convertToBaseValue(used) / convertToBaseValue(max)) * 100;
  return {
    used,
    max,
    percent,
  };
};

const tableColumnClasses = [
  classNames('col-md-5', 'col-xs-6'),
  classNames('col-md-7', 'col-xs-6'),
  Kebab.columnClass,
];

const ClusterResourceQuotaTableHeader = () => {
  return [
    {
      title: 'Name',
      sortField: 'metadata.name',
      transforms: [sortable],
      props: { className: tableColumnClasses[0] },
    },
  ];
};
ClusterResourceQuotaTableHeader.displayName = 'ClusterResourceQuotaTableHeader';

export const ClusterResourceQuotaTableRow = ({ obj: rq, index, key, style }) => {
  return (
    <TableRow id={rq.metadata.uid} index={index} trKey={key} style={style}>
      <TableData className={tableColumnClasses[0]}>
        <ResourceLink
          kind={referenceForModel(ClusterResourceQuotaModel)}
          name={rq.metadata.name}
          className="co-resource-item__resource-name"
        />
      </TableData>
    </TableRow>
  );
};

export const UsageIcon = ({ percent }) => {
  let usageIcon = <UnknownIcon />;
  if (percent === 0) {
    usageIcon = <OutlinedCircleIcon className="co-resource-quota-empty" />;
  } else if (percent > 0 && percent < 50) {
    usageIcon = <ResourcesAlmostEmptyIcon className="co-resource-quota-almost-empty" />;
  } else if (percent >= 50 && percent < 100) {
    usageIcon = <ResourcesAlmostFullIcon className="co-resource-quota-almost-full" />;
  } else if (percent === 100) {
    usageIcon = <ResourcesFullIcon className="co-resource-quota-full" />;
  } else if (percent > 100) {
    usageIcon = <YellowExclamationTriangleIcon className="co-resource-quota-exceeded" />;
  }
  return usageIcon;
};

export const ResourceUsageRow = ({ quota, resourceType }) => {
  const { used, max, percent } = getResourceUsage(quota, resourceType);
  return (
    <div className="row co-m-row">
      <div className="col-sm-4 col-xs-6 co-break-word">{resourceType}</div>
      <div className="col-sm-2 hidden-xs co-resource-quota-icon">
        <UsageIcon percent={percent} />
      </div>
      <div className="col-sm-3 col-xs-3">{used}</div>
      <div className="col-sm-3 col-xs-3">{max}</div>
    </div>
  );
};

const NoQuotaGuage = ({ title, className }) => (
  <GaugeChart error="No Quota" thresholds={[{ value: 100 }]} title={title} className={className} />
);

export const QuotaGaugeCharts = ({ quota, resourceTypes, chartClassName = null }) => {
  const resourceTypesSet = new Set(resourceTypes);
  const cpuRequestUsagePercent = getResourceUsage(
    quota,
    resourceTypesSet.has('requests.cpu') ? 'requests.cpu' : 'cpu',
  ).percent;
  const memoryRequestUsagePercent = getResourceUsage(
    quota,
    resourceTypesSet.has('requests.memory') ? 'requests.memory' : 'memory',
  ).percent;
  const gpuRequestUsagePercent = getResourceUsage(quota, 'requests.nvidia.com/gpu').percent;
  const storageRequestUsagePercent = getResourceUsage(
    quota,
    'basic.storageclass.storage.k8s.io/requests.storage',
  ).percent;
  const podsRequestUsagePercent = getResourceUsage(quota, 'pods').percent;
  // const cpuLimitUsagePercent = getResourceUsage(quota, 'limits.cpu').percent;

  // const memoryLimitUsagePercent = getResourceUsage(quota, 'limits.memory').percent;
  return (
    <div className="co-resource-quota-chart-row">
      {resourceTypesSet.has('requests.cpu') || resourceTypesSet.has('cpu') ? (
        <div className="co-resource-quota-gauge-chart">
          <GaugeChart
            data={{
              x: `${cpuRequestUsagePercent}%`,
              y: cpuRequestUsagePercent,
            }}
            thresholds={gaugeChartThresholds}
            title="CPU"
            className={chartClassName}
          />
        </div>
      ) : (
        <div className="co-resource-quota-gauge-chart">
          <NoQuotaGuage title="CPU" />
        </div>
      )}

      {resourceTypesSet.has('requests.memory') || resourceTypesSet.has('memory') ? (
        <div className="co-resource-quota-gauge-chart">
          <GaugeChart
            data={{
              x: `${memoryRequestUsagePercent}%`,
              y: memoryRequestUsagePercent,
            }}
            thresholds={gaugeChartThresholds}
            title="Memory"
            className={chartClassName}
          />
        </div>
      ) : (
        <div className="co-resource-quota-gauge-chart">
          <NoQuotaGuage title="Memory Request" className={chartClassName} />
        </div>
      )}

      {resourceTypesSet.has('requests.nvidia.com/gpu') ? (
        <div className="co-resource-quota-gauge-chart">
          <GaugeChart
            data={{
              x: `${gpuRequestUsagePercent}%`,
              y: gpuRequestUsagePercent,
            }}
            thresholds={gaugeChartThresholds}
            title="GPU"
            className={chartClassName}
          />
        </div>
      ) : (
        <div className="co-resource-quota-gauge-chart">
          <NoQuotaGuage title="GPU" />
        </div>
      )}

      {resourceTypesSet.has('basic.storageclass.storage.k8s.io/requests.storage') ? (
        <div className="co-resource-quota-gauge-chart">
          <GaugeChart
            data={{
              x: `${storageRequestUsagePercent}%`,
              y: storageRequestUsagePercent,
            }}
            thresholds={gaugeChartThresholds}
            title="Storage"
            className={chartClassName}
          />
        </div>
      ) : (
        <div className="co-resource-quota-gauge-chart">
          <NoQuotaGuage title="Storage" />
        </div>
      )}

      {resourceTypesSet.has('pods') ? (
        <div className="co-resource-quota-gauge-chart">
          <GaugeChart
            data={{
              x: `${podsRequestUsagePercent}%`,
              y: podsRequestUsagePercent,
            }}
            thresholds={gaugeChartThresholds}
            title="Pods"
            className={chartClassName}
          />
        </div>
      ) : (
        <div className="co-resource-quota-gauge-chart">
          <NoQuotaGuage title="Pods" />
        </div>
      )}
    </div>
  );
};

export const QuotaScopesInline = ({ scopes, className }) => {
  return (
    <span className={classNames(className)}>
      (
      {scopes
        .map((scope) => {
          const scopeObj = _.get(quotaScopes, scope);
          return scopeObj ? scopeObj.label : scope;
        })
        .join(',')}
      )
    </span>
  );
};

export const QuotaScopesList = ({ scopes }) => {
  return scopes.map((scope) => {
    const scopeObj = _.get(quotaScopes, scope);
    return scopeObj ? (
      <dd key={scope}>
        <div className="co-resource-quota-scope__label">{scopeObj.label}</div>
        <div className="co-resource-quota-scope__description">{scopeObj.description}</div>
      </dd>
    ) : (
      <dd key={scope} className="co-resource-quota-scope__label">
        {scope}
      </dd>
    );
  });
};

export const hasComputeResources = (resourceTypes) => {
  const chartResourceTypes = [
    'requests.cpu',
    'cpu',
    'limits.cpu',
    'requests.memory',
    'memory',
    'limits.memory',
  ];
  return _.intersection(resourceTypes, chartResourceTypes).length > 0;
};

const Details = ({ obj: rq }) => {
  const resourceTypes = getQuotaResourceTypes(rq);
  const showChartRow = hasComputeResources(resourceTypes);
  const scopes = _.get(rq, ['spec', 'scopes']);
  const label = ClusterResourceQuotaModel.label;
  return (
    <>
      <div className="co-m-pane__body">
        <SectionHeading text={`${label} Details`} />
        {showChartRow && <QuotaGaugeCharts quota={rq} resourceTypes={resourceTypes} />}
        <div className="row">
          {scopes && (
            <div className="col-sm-6">
              <dl className="co-m-pane__details">
                <dt>Scopes</dt>
                <QuotaScopesList scopes={scopes} />
              </dl>
            </div>
          )}
        </div>
      </div>
      <div className="co-m-pane__body">
        <SectionHeading
          text={`${label} Details`}
          style={{ display: 'block', marginBottom: '20px' }}
        />
        <div className="co-m-table-grid co-m-table-grid--bordered">
          <div className="row co-m-table-grid__head">
            <div className="col-sm-4 col-xs-6">Resource Type</div>
            <div className="col-sm-2 hidden-xs">Capacity</div>
            <div className="col-sm-3 col-xs-3">Used</div>
            <div className="col-sm-3 col-xs-3">Max</div>
          </div>
          <div className="co-m-table-grid__body">
            {resourceTypes.map((type) => (
              <ResourceUsageRow key={type} quota={rq} resourceType={type} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export const ClusterResourceQuotasList = (props) => (
  <Table
    {...props}
    aria-label="Cluster Resource Quoates"
    Header={ClusterResourceQuotaTableHeader}
    Row={ClusterResourceQuotaTableRow}
    virtualize
  />
);

export const ClusterResourceQuotasPage = (props) => {
  // const { canCreate = true } = props;
  return (
    <ListPage
      canCreate={false}
      showTitle={false}
      kind={ClusterResourceQuotaReference}
      ListComponent={ClusterResourceQuotasList}
      {...props}
    />
  );
};

export const ClusterResourceQuotasDetailsPage = (props) => (
  <DetailsPage
    {...props}
    // menuActions={resourceQuotaMenuActions}
    pages={[navFactory.details(Details)]}
  />
);
