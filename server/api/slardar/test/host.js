module.exports = {
  // name: 'host',
  path: 'nova/host.js',
  test: {
    getHostList: {
      path: '/api/v1/:projectId/hypervisors/detail',
      input: {
        query: {
          limit: 1
        }
      },
      output: {
        'hypervisors': [
          {
            'status': 'enabled',
            'service': {
              'host': 'server-68',
              'disabled_reason': null,
              'id': 51
            },
            'vcpus_used': 0,
            'hypervisor_type': 'QEMU',
            'local_gb_used': 0,
            'vcpus': 4,
            'hypervisor_hostname': 'server-68.0.example242.ustack.in',
            'memory_mb_used': 512,
            'memory_mb': 7823,
            'current_workload': 0,
            'state': 'up',
            'host_ip': '10.242.0.68',
            'cpu_info': '{\'vendor\': \'Intel\', \'model\': \'IvyBridge\', \'arch\': \'x86_64\', \'features\': [\'pge\', \'avx\', \'clflush\', \'sep\', \'syscall\', \'tsc-deadline\', \'msr\', \'fsgsbase\', \'xsave\', \'erms\', \'cmov\', \'smep\', \'pcid\', \'pat\', \'lm\', \'tsc\', \'nx\', \'fxsr\', \'sse4.1\', \'pae\', \'sse4.2\', \'pclmuldq\', \'vme\', \'mmx\', \'osxsave\', \'cx8\', \'mce\', \'de\', \'rdtscp\', \'mca\', \'pse\', \'lahf_lm\', \'popcnt\', \'pdpe1gb\', \'apic\', \'sse\', \'f16c\', \'pni\', \'aes\', \'sse2\', \'ss\', \'hypervisor\', \'ssse3\', \'fpu\', \'cx16\', \'pse36\', \'mtrr\', \'rdrand\', \'x2apic\'], \'topology\': {\'cores\': 1, \'cells\': 1, \'threads\': 1, \'sockets\': 4}}',
            'running_vms': 0,
            'free_disk_gb': 272,
            'hypervisor_version': 1005003,
            'disk_available_least': 98,
            'local_gb': 272,
            'free_ram_mb': 7311,
            'id': 6
          }
        ],
        'hypervisors_links': [
          {
            'href': '/api/v1/hypervisors?page=2&limit=1',
            'rel': 'next'
          }
        ]
      }
    }
  }
};
