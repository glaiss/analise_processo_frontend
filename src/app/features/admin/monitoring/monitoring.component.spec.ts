import { TestBed } from '@angular/core/testing';
import { MonitoringComponent } from './monitoring.component';
import { ActuatorService, AppInfo, Health, Metric } from '../../../core/services/actuator.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

describe('MonitoringComponent', () => {
  let mockActuator: Partial<ActuatorService>;

  function createMetric(value: number, statistic?: string): Metric {
    return { name: 'test', measurements: statistic ? [{ statistic, value }] : [{ value }], availableTags: [] };
  }

  beforeEach(async () => {
    mockActuator = {
      getInfo: vi.fn().mockReturnValue(of<AppInfo>({ build: { artifact: 'app', version: '1.0.0', name: 'test', time: '2024-01-01' } })),
      getHealth: vi.fn().mockReturnValue(of<Health>({ status: 'UP', components: { db: { status: 'UP' }, diskSpace: { status: 'UP', details: { free: 5000000000, total: 10000000000 } } } })),
      getMetric: vi.fn().mockImplementation((name: string) => {
        if (name.includes('memory.used')) return of(createMetric(500000000));
        if (name.includes('memory.max')) return of(createMetric(1000000000));
        if (name.includes('memory.committed')) return of(createMetric(800000000));
        if (name.includes('nonheap')) return of(createMetric(100000000));
        if (name.includes('cpu.usage')) return of(createMetric(0.5));
        if (name.includes('threads.live')) return of(createMetric(10));
        if (name.includes('threads.peak')) return of(createMetric(15));
        if (name.includes('hikaricp.connections.active')) return of(createMetric(3));
        if (name.includes('hikaricp.connections.idle')) return of(createMetric(5));
        if (name.includes('hikaricp.connections.max')) return of(createMetric(20));
        if (name.includes('classes.loaded')) return of(createMetric(5000));
        if (name.includes('uptime')) return of(createMetric(3600000));
        if (name.includes('gc.pause')) {return of({
          name: 'gc.pause',
          measurements: [
            { statistic: 'COUNT', value: 10 },
            { statistic: 'TOTAL_TIME', value: 500 },
            { statistic: 'MAX', value: 100 }
          ],
          availableTags: []
        });}
        if (name.includes('gc.memory.allocated')) return of(createMetric(1000000));
        if (name.includes('gc.live.data.size')) return of(createMetric(200000));
        if (name.includes('buffer.memory.used')) {
          if (name.includes('direct')) return of(createMetric(50000));
          return of(createMetric(30000));
        }
        if (name.includes('daemon')) return of(createMetric(5));
        if (name.includes('files.open')) return of(createMetric(50));
        if (name.includes('files.max')) return of(createMetric(1000));
        if (name.includes('load.average')) return of(createMetric(0.8));
        if (name.includes('pending')) return of(createMetric(0));
        if (name.includes('timeout')) return of(createMetric(0));
        if (name.includes('cpu.count')) return of(createMetric(8));
        if (name.includes('classes.unloaded')) return of(createMetric(10));
        if (name.includes('sessions.active')) return of(createMetric(2));
        if (name.includes('connections.acquire')) return of(createMetric(5));
        return of(createMetric(0));
      })
    };

    await TestBed.configureTestingModule({
      imports: [MonitoringComponent, NoopAnimationsModule],
      providers: [{ provide: ActuatorService, useValue: mockActuator }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MonitoringComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load all metrics on init', () => {
    const fixture = TestBed.createComponent(MonitoringComponent);
    fixture.detectChanges();

    expect(mockActuator.getInfo).toHaveBeenCalled();
    expect(mockActuator.getHealth).toHaveBeenCalled();
    expect(fixture.componentInstance.health()?.status).toBe('UP');
    expect(fixture.componentInstance.appInfo()?.build?.version).toBe('1.0.0');
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('should compute heap metric', () => {
    const fixture = TestBed.createComponent(MonitoringComponent);
    fixture.detectChanges();

    const heap = fixture.componentInstance.heap();
    expect(heap).toBeTruthy();
    expect(heap!.used).toBe(500000000);
    expect(heap!.max).toBe(1000000000);
    expect(heap!.unit).toBe('bytes');
  });

  it('should compute cpu metric', () => {
    const fixture = TestBed.createComponent(MonitoringComponent);
    fixture.detectChanges();

    const cpu = fixture.componentInstance.cpu();
    expect(cpu).toBeTruthy();
    expect(cpu!.system).toBe(0.5);
    expect(cpu!.process).toBe(0.5);
  });

  it('should compute dbPool metric', () => {
    const fixture = TestBed.createComponent(MonitoringComponent);
    fixture.detectChanges();

    const pool = fixture.componentInstance.dbPool();
    expect(pool).toBeTruthy();
    expect(pool!.label).toBe('Conexões');
    expect(pool!.used).toBe(3);
  });

  it('should compute gcPause metric', () => {
    const fixture = TestBed.createComponent(MonitoringComponent);
    fixture.detectChanges();

    const gc = fixture.componentInstance.gcPause();
    expect(gc).toBeTruthy();
    expect(gc!.count).toBe(10);
    expect(gc!.totalTime).toBe(500);
    expect(gc!.maxTime).toBe(100);
  });

  it('formatBytes should return correct format', () => {
    const fixture = TestBed.createComponent(MonitoringComponent);
    const component = fixture.componentInstance;
    expect(component.formatBytes(0)).toBe('0 B');
    expect(component.formatBytes(1024)).toBe('1 KB');
    expect(component.formatBytes(1048576)).toBe('1 MB');
    expect(component.formatBytes(1073741824)).toBe('1 GB');
  });

  it('formatUptime should return correct format', () => {
    const fixture = TestBed.createComponent(MonitoringComponent);
    const component = fixture.componentInstance;
    expect(component.formatUptime(5000)).toBe('5s');
    expect(component.formatUptime(65000)).toBe('1m 5s');
    expect(component.formatUptime(3661000)).toBe('1h 1m 1s');
    expect(component.formatUptime(90061000)).toBe('1d 1h 1m 1s');
  });

  it('formatMs should return correct format', () => {
    const fixture = TestBed.createComponent(MonitoringComponent);
    const component = fixture.componentInstance;
    expect(component.formatMs(500)).toBe('500ms');
    expect(component.formatMs(1500)).toBe('1.5s');
    expect(component.formatMs(120000)).toBe('2.0min');
  });

  it('getStatusColor should return correct color', () => {
    const fixture = TestBed.createComponent(MonitoringComponent);
    const component = fixture.componentInstance;
    expect(component.getStatusColor('UP')).toBe('primary');
    expect(component.getStatusColor('DOWN')).toBe('warn');
    expect(component.getStatusColor('OUT_OF_SERVICE')).toBe('warn');
    expect(component.getStatusColor('UNKNOWN')).toBe('accent');
    expect(component.getStatusColor(undefined)).toBe('');
  });

  it('refresh should call loadAll', () => {
    const fixture = TestBed.createComponent(MonitoringComponent);
    fixture.detectChanges();

    const spy = vi.spyOn(fixture.componentInstance, 'loadAll');
    fixture.componentInstance.refresh();
    expect(spy).toHaveBeenCalled();
  });
});
