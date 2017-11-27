const fetch = require('client/applications/dashboard/cores/fetch');
const __ = require('locale/client/dashboard.lang.json');
const storage = require('client/applications/dashboard/cores/storage');

const React = require('react');
const RSVP = require('rsvp');
const moment = require('client/libs/moment');

module.exports = {
  getEvents: function(forced) {
    return storage.getList(['instance'], forced).then(res => {
      return this.getEventList().then(data => {
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
          if (r.event_type === 'compute.instance.volume.attach' || r.event_type === 'compute.instance.volume.detach') {
            r.operation = __[eventType[3]] + __[eventType[2]];
          } else if (r.event_type === 'compute.instance.resize.confirm.start') {
            r.operation = __[eventType[2]];
          } else {
            r.operation = __[eventType[2]] + __.instance;
          }
          r.traits.forEach(tr => {
            if (tr.name === 'instance_id') {
              r.name = <div><i className="glyphicon icon-instance"></i>{'(' + tr.value.substring(0, 8) + ')'}</div>;
              res.instance.some(ins => {
                if (ins.id === tr.value) {
                  r.name = <div>
                      <i className="glyphicon icon-instance" />
                      <a data-type="router" href={'/dashboard/instance/' + ins.id}>
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
  getEventList: function() {
    let eventTypes = ['compute.instance.create.end', 'compute.instance.delete.end', 'compute.instance.reboot.end',
      'compute.instance.volume.attach', 'compute.instance.volume.detach', 'compute.instance.power_off.end',
      'compute.instance.power_on.end', 'compute.instance.resize.confirm.start'];

    let deferredList = [];
    eventTypes.forEach((item) => {
      deferredList.push(fetch.get({
        url: '/proxy/ceilometer/v2/events?q.field=event_type\&q.op=eq\&q.value=' + item
      }));
    });
    return RSVP.all(deferredList);
  }
};
