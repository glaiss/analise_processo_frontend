import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActuatorService } from './actuator.service';
import { environment } from '../../../environments/environment';
const BASE_URL = `${environment.apiUrl}/actuator`;
describe('ActuatorService', () => {
  let service: ActuatorService;
  let httpMock: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ActuatorService],
    });
    service = TestBed.inject(ActuatorService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => httpMock.verify());
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  describe('getHealth', () => {
    it('should GET health', () => {
      const mockHealth = { status: 'UP' };
      service.getHealth().subscribe((h) => expect(h).toEqual(mockHealth));
      const req = httpMock.expectOne(`${BASE_URL}/health`);
      expect(req.request.method).toBe('GET');
      req.flush(mockHealth);
    });
  });
  describe('getInfo', () => {
    it('should GET info', () => {
      const mockInfo = { app: { name: 'test', version: '1.0' } };
      service.getInfo().subscribe((i) => expect(i).toEqual(mockInfo));
      const req = httpMock.expectOne(`${BASE_URL}/info`);
      expect(req.request.method).toBe('GET');
      req.flush(mockInfo);
    });
  });
  describe('getMetric', () => {
    it('should GET metric by name', () => {
      service.getMetric('jvm.memory.used').subscribe();
      const req = httpMock.expectOne(`${BASE_URL}/metrics/jvm.memory.used`);
      expect(req.request.method).toBe('GET');
      req.flush({ name: 'jvm.memory.used', measurements: [], availableTags: [] });
    });
    it('should include tag param when provided', () => {
      service.getMetric('jvm.memory.used', 'area:heap').subscribe();
      const req = httpMock.expectOne(`${BASE_URL}/metrics/jvm.memory.used?tag=area:heap`);
      expect(req.request.method).toBe('GET');
      req.flush({ name: 'jvm.memory.used', measurements: [], availableTags: [] });
    });
  });
});
