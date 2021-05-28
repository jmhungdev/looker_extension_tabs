import { LookerEmbedDashboard, LookerEmbedSDK } from '@looker/embed-sdk';
import { LookerDashboardOptions } from '@looker/embed-sdk/lib/types';
import React, { useCallback } from 'react';
import { EmbedContainer } from './components/EmbedContainer';


export const Dashboard: React.FC<any> = ({
  id,
  dashboard,
  theme,
  next,
  extensionContext,
  setDashboard,
  filters,
  handleUpdateFilters
}) => {

  const openExploreInNewWindow = (event: any) => {
    const db = LookerEmbedSDK.createExploreWithUrl(event.url)
    extensionContext.extensionSDK.openBrowserWindow(db.url, '_explore')
    return { cancel: !event.modal }
  }

  const canceller = (event: any) => {
    return { cancel: !event.modal }
  }

  const setupDashboard = (dashboard: LookerEmbedDashboard) => {
    const elementOptions = { elements: { 'test': { title_hidden: true } } }
    dashboard.setOptions(elementOptions as LookerDashboardOptions)
    setDashboard(dashboard)
    dashboard.setOptions(elementOptions as LookerDashboardOptions)

  }

  const runDashboard = () => {
    if (dashboard) {
      dashboard.run()
    }
  }

  const filtersUpdated = (jsEvent: { dashboard: { dashboard_filters: any; }; }) => {
    handleUpdateFilters(jsEvent.dashboard.dashboard_filters);
    if (dashboard) {
        dashboard.run();
    }
};

  const embedCtrRef = useCallback(
    (el) => {
      const hostUrl = extensionContext?.extensionSDK?.lookerHostData?.hostUrl
      if (el && hostUrl) {
        el.innerHTML = ''
        LookerEmbedSDK.init(hostUrl)
        const db = LookerEmbedSDK.createDashboardWithId(id as string)
        db.withTheme(theme as string)
        if (next) {
          db.withNext('-next')
        }
        db.appendTo(el)
          .on('dashboard:filters:changed', filtersUpdated)
          .on('drillmenu:click', canceller)
          .on('drillmodal:explore', canceller)
          .on('dashboard:tile:explore', openExploreInNewWindow)
          .on('dashboard:tile:view', canceller)
          .withFilters(filters)
          .build()
          .connect()
          .then(setupDashboard)
          .catch((error: Error) => {
            console.error('Connection error', error)
          })
      }
    },
    [next]
  )

  return (
    <>
      <EmbedContainer ref={embedCtrRef} />
    </>
  )
}
