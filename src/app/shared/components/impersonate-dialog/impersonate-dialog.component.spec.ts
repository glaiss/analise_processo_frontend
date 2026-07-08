import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef } from '@angular/material/dialog';
import { ImpersonateDialogComponent } from './impersonate-dialog.component';
import { UserService } from '../../../core/services/user.service';

describe('ImpersonateDialogComponent', () => {
  let dialogRef: any;
  let userService: any;

  const mockUsers = [
    { id: '1', username: 'admin@test.com', nome: 'Admin User', role: 'ADMIN' },
    { id: '2', username: 'analyst@test.com', nome: 'Analyst User', role: 'ANALISTA' },
  ];

  beforeEach(async () => {
    dialogRef = { close: vi.fn() };

    userService = {
      getUsuarios: vi.fn().mockReturnValue({
        subscribe: (callbacks: any) => {
          callbacks.next({ content: mockUsers, totalElements: 2 });
        },
      }),
    };

    await TestBed.configureTestingModule({
      imports: [ImpersonateDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: UserService, useValue: userService },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ImpersonateDialogComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load users on init', () => {
    const fixture = TestBed.createComponent(ImpersonateDialogComponent);
    fixture.detectChanges();
    expect(userService.getUsuarios).toHaveBeenCalledWith(0, 500);
    expect(fixture.componentInstance.allUsers()).toEqual(mockUsers);
  });

  it('should set loading to true during user fetch', () => {
    userService.getUsuarios.mockReturnValue({ subscribe: () => {} });
    const fixture = TestBed.createComponent(ImpersonateDialogComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.loading()).toBe(true);
  });

  it('should handle error when loading users fails', () => {
    userService.getUsuarios.mockReturnValue({
      subscribe: (callbacks: any) => callbacks.error('fail'),
    });
    const fixture = TestBed.createComponent(ImpersonateDialogComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.loading()).toBe(false);
    expect(fixture.componentInstance.allUsers()).toEqual([]);
  });

  it('should return all users when search term is empty', () => {
    const fixture = TestBed.createComponent(ImpersonateDialogComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.filteredUsers()).toEqual(mockUsers);
  });

  it('should filter users by nome', () => {
    const fixture = TestBed.createComponent(ImpersonateDialogComponent);
    fixture.componentInstance.searchTerm = 'Admin';
    fixture.detectChanges();
    const result = fixture.componentInstance.filteredUsers();
    expect(result.length).toBe(1);
    expect(result[0].nome).toBe('Admin User');
  });

  it('should filter users by username', () => {
    const fixture = TestBed.createComponent(ImpersonateDialogComponent);
    fixture.componentInstance.searchTerm = 'analyst';
    fixture.detectChanges();
    const result = fixture.componentInstance.filteredUsers();
    expect(result.length).toBe(1);
    expect(result[0].nome).toBe('Analyst User');
  });

  it('should show no results when search does not match', () => {
    const fixture = TestBed.createComponent(ImpersonateDialogComponent);
    fixture.componentInstance.searchTerm = 'nonexistent';
    fixture.detectChanges();
    expect(fixture.componentInstance.filteredUsers()).toEqual([]);
    expect(fixture.componentInstance.noResults()).toBe(true);
  });

  it('should compute noResults as false when results exist', () => {
    const fixture = TestBed.createComponent(ImpersonateDialogComponent);
    fixture.componentInstance.searchTerm = 'Admin';
    fixture.detectChanges();
    expect(fixture.componentInstance.noResults()).toBe(false);
  });

  it('should clear selectedEmail on search input', () => {
    const fixture = TestBed.createComponent(ImpersonateDialogComponent);
    fixture.detectChanges();
    fixture.componentInstance.selectedEmail = 'test@test.com';
    fixture.componentInstance.onSearchInput();
    expect(fixture.componentInstance.selectedEmail).toBe('');
  });

  it('should set selectedEmail and searchTerm on user selected', () => {
    const fixture = TestBed.createComponent(ImpersonateDialogComponent);
    fixture.detectChanges();
    const event = { option: { value: 'admin@test.com' } };
    fixture.componentInstance.onUserSelected(event);
    expect(fixture.componentInstance.selectedEmail).toBe('admin@test.com');
    expect(fixture.componentInstance.searchTerm).toBe('admin@test.com');
  });

  it('should close dialog with email on confirm when selectedEmail is set', () => {
    const fixture = TestBed.createComponent(ImpersonateDialogComponent);
    fixture.detectChanges();
    fixture.componentInstance.selectedEmail = 'admin@test.com';
    fixture.componentInstance.confirm();
    expect(dialogRef.close).toHaveBeenCalledWith('admin@test.com');
  });

  it('should close dialog with searchTerm when selectedEmail is empty', () => {
    const fixture = TestBed.createComponent(ImpersonateDialogComponent);
    fixture.detectChanges();
    fixture.componentInstance.selectedEmail = '';
    fixture.componentInstance.searchTerm = 'analyst@test.com';
    fixture.componentInstance.confirm();
    expect(dialogRef.close).toHaveBeenCalledWith('analyst@test.com');
  });

  it('should not close dialog when both email and searchTerm are empty', () => {
    const fixture = TestBed.createComponent(ImpersonateDialogComponent);
    fixture.detectChanges();
    fixture.componentInstance.selectedEmail = '';
    fixture.componentInstance.searchTerm = '';
    fixture.componentInstance.confirm();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('should cancel and close dialog on cancel button', () => {
    const fixture = TestBed.createComponent(ImpersonateDialogComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const cancelButton = compiled.querySelector('button[type="button"]');
    expect(cancelButton).toBeTruthy();
    cancelButton.click();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('should render dialog title', () => {
    const fixture = TestBed.createComponent(ImpersonateDialogComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Entrar como outro usuário');
  });

  it('should render search input', () => {
    const fixture = TestBed.createComponent(ImpersonateDialogComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const input = compiled.querySelector('input');
    expect(input).toBeTruthy();
    expect(input.placeholder).toBe('Digite nome ou e-mail...');
  });

  it('should show loading spinner when loading is true', () => {
    userService.getUsuarios.mockReturnValue({ subscribe: () => {} });
    const fixture = TestBed.createComponent(ImpersonateDialogComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('mat-spinner')).toBeTruthy();
  });

  it('should show person_search icon when not loading', () => {
    const fixture = TestBed.createComponent(ImpersonateDialogComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('mat-icon[matSuffix]')).toBeTruthy();
  });

  it('should disable confirm button when no email or search term', () => {
    const fixture = TestBed.createComponent(ImpersonateDialogComponent);
    fixture.componentInstance.selectedEmail = '';
    fixture.componentInstance.searchTerm = '';
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const confirmBtn = compiled.querySelector('button[mat-flat-button]');
    expect(confirmBtn.disabled).toBe(true);
  });

  it('should enable confirm button when search term is present', () => {
    const fixture = TestBed.createComponent(ImpersonateDialogComponent);
    fixture.componentInstance.searchTerm = 'test';
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const confirmBtn = compiled.querySelector('button[mat-flat-button]');
    expect(confirmBtn.disabled).toBe(false);
  });
});
