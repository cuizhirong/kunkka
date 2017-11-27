const fetch = require('client/applications/dashboard/cores/fetch');
const __ = require('locale/client/dashboard.lang.json');
const storage = require('client/applications/dashboard/cores/storage');

const React = require('react');
const RSVP = require('rsvp');
const moment = require('client/libs/moment');

module.exports = {
  getEvents: function(forced) {
    return storage.getList(['router'], forced).then(res => {
      return this.getRouterlogList().then(data => {
        let events = [];
        data.forEach(i => {
          events = events.concat(i);
        });
        let sortTime = (a, b) => {
          return moment(b.generated).toDate().getTime() - moment(a.generated).toDate().getTime();
        };
        events.sort(sortTime);
        events.forEach((r, index) => {
          let eventType = r.event_type.split('.');
          if (eventType.length === 4) {
            r.operation = __[eventType[2]] + __[eventType[1]];
          } else {
            r.operation = __[eventType[1]] + __[eventType[0]];
          }
          r.traits.forEach(tr => {
            if (tr.name === 'resource_id') {
              r.name = <div><i className={'glyphicon icon-' + eventType[0]}></i>{'(' + tr.value.substring(0, 8) + ')'}</div>;
              res[eventType[0]].some(ins => {
                if (ins.id === tr.value) {
                  r.name = <div>
                      <i className={'glyphicon icon-' + eventType[0]}/>
                      <a data-type="router" href={'/dashboard/' + eventType[0] + '/' + ins.id}>
                      {ins.name || '(' + ins.id.substring(0, 8) + ')'}
                      </a>
                    </div>;
                  return true;
                }
              });
              r.id = tr.value + index;
              r.resource_id = tr.value;
            } else if (tr.name === 'user_id') {
              r.user_id = tr.value;
            }
          });
        });

        return events;
      });
    });
  },
  getRouterlogList: function() {
    let eventTypes = ['router.create.end', 'router.delete.end', 'router.update.start', 'router.update.end'/*, 'router.interface.create', 'router.interface.delete'*/];

    let deferredList = [];
    eventTypes.forEach((item) => {
      deferredList.push(fetch.get({
        url: '/proxy/ceilometer/v2/events?q.field=event_type\&q.op=eq\&q.value=' + item
      }));
    });
    return RSVP.all(deferredList);
  }
};
