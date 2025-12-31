describe('Ticket System MVP', () => {
  beforeEach(() => {
    // Clear tickets before each test
    cy.task('clearTickets');
  });

  it('loads the home page', () => {
    cy.visit('/');
    cy.contains('Tickets').should('be.visible');
    cy.contains('Create Ticket').should('be.visible');
  });

  it('creates a ticket via form', () => {
    cy.visit('/');
    cy.contains('Create Ticket').click();
    cy.url().should('include', '/create');
    cy.get('[data-cy="title-input"]').type('Test Ticket');
    cy.get('[data-cy="description-textarea"]').type('Test Description');
    cy.get('[data-cy="submit-button"]').click();
    cy.url().should('eq', 'http://localhost:3000/');
    cy.contains('Test Ticket');
  });

  it('views ticket list', () => {
    // Create a ticket first
    cy.request('POST', '/api/tickets', {
      title: 'List Test Ticket',
      description: 'Desc',
      priority: 'high',
      status: 'open',
      category: 'Support',
      assignedTo: '',
      channel: 'form',
      sender: { email: 'list@example.com', phone: '' }
    });
    cy.visit('/');
    cy.contains('List Test Ticket');
    cy.contains('high');
  });

  it('views ticket details', () => {
    // Create a ticket
    cy.request('POST', '/api/tickets', {
      title: 'Detail Test',
      description: 'Detail desc',
      status: 'open',
      priority: 'low',
      category: 'Bug',
      assignedTo: 'John',
      channel: 'form',
      sender: { email: '', phone: '' }
    }).then((response) => {
      const ticketId = response.body.id;
      cy.visit(`/ticket/${ticketId}`);
      cy.contains('Detail Test');
      cy.contains('Detail desc');
      cy.contains('Comments');
      // Check selects have correct values
      cy.get('[data-cy="status-select"]').should('contain', 'Open');
      cy.get('[data-cy="priority-select"]').should('contain', 'Low');
      cy.get('[data-cy="category-select"]').should('contain', 'Bug');
      cy.get('[data-cy="assigned-input"]').should('have.value', 'John');
    });
  });

  it('edits ticket fields', () => {
    // Create a ticket
    cy.request('POST', '/api/tickets', {
      title: 'Edit Test',
      description: 'Edit desc',
      status: 'open',
      priority: 'medium',
      category: 'Support',
      assignedTo: '',
      channel: 'form',
      sender: { email: '', phone: '' }
    }).then((response) => {
      const ticketId = response.body.id;
      cy.visit(`/ticket/${ticketId}`);
      // Change fields
      cy.get('[data-cy="status-select"]').click();
      cy.contains('Pending').click();
      cy.get('[data-cy="priority-select"]').click();
      cy.contains('High').click();
      cy.get('[data-cy="category-select"]').click();
      cy.contains('Bug').click();
      cy.get('[data-cy="assigned-input"]').clear().type('Alice');
      cy.contains('Save Changes').click();
      // Check updated
      cy.get('[data-cy="status-select"]').should('contain', 'Pending');
      cy.get('[data-cy="priority-select"]').should('contain', 'High');
      cy.get('[data-cy="category-select"]').should('contain', 'Bug');
      cy.get('[data-cy="assigned-input"]').should('have.value', 'Alice');
    });
  });

  it('closes ticket and redirects', () => {
    // Create a ticket
    cy.request('POST', '/api/tickets', {
      title: 'Close Test',
      description: 'Close desc',
      status: 'open',
      priority: 'medium',
      category: 'Support',
      assignedTo: '',
      channel: 'form',
      sender: { email: '', phone: '' }
    }).then((response) => {
      const ticketId = response.body.id;
      cy.visit(`/ticket/${ticketId}`);
      // Close ticket
      cy.get('[data-cy="close-button"]').click({force: true});
      cy.contains('Close Ticket').click(); // In dialog
      // Check redirected to home
      cy.url().should('eq', 'http://localhost:3000/');
      cy.contains('Close Test'); // Ticket should be in list
    });
  });

  it('adds and views comments', () => {
    // Create a ticket
    cy.request('POST', '/api/tickets', {
      title: 'Comment Test',
      description: 'Test desc',
      status: 'open',
      priority: 'medium',
      category: 'Support',
      assignedTo: '',
      channel: 'form',
      sender: { email: '', phone: '' }
    }).then((response) => {
      const ticketId = response.body.id;
      cy.visit(`/ticket/${ticketId}`);
      // Check no comments initially
      cy.get('[data-cy="comments-list"]').contains('No comments yet.');
      // Add first reply
      cy.get('[data-cy="reply-textarea"]').type('First reply');
      cy.get('[data-cy="reply-button"]').click();
      cy.get('[data-cy="comments-list"]').children().should('have.length', 1);
      cy.contains('rep: First reply');
      // Add second reply
      cy.get('[data-cy="reply-textarea"]').type('Second reply');
      cy.get('[data-cy="reply-button"]').click();
      cy.get('[data-cy="comments-list"]').children().should('have.length', 2);
      cy.contains('rep: Second reply');
    });
  });

  it('filters tickets with multiple selections', () => {
    // Create tickets with different statuses/priorities
    cy.request('POST', '/api/tickets', {
      title: 'Open Low',
      description: 'Desc',
      status: 'open',
      priority: 'low',
      category: 'Bug',
      assignedTo: '',
      channel: 'form',
      sender: { email: '', phone: '' }
    });
    cy.request('POST', '/api/tickets', {
      title: 'Pending High',
      description: 'Desc',
      status: 'pending',
      priority: 'high',
      category: 'Feature',
      assignedTo: '',
      channel: 'form',
      sender: { email: '', phone: '' }
    });
    cy.request('POST', '/api/tickets', {
      title: 'Closed Medium',
      description: 'Desc',
      status: 'closed',
      priority: 'medium',
      category: 'Support',
      assignedTo: '',
      channel: 'form',
      sender: { email: '', phone: '' }
    });
    cy.visit('/');
    // Filter by multiple statuses: open and pending
    cy.get('#status-open').click();
    cy.get('#status-pending').click();
    cy.contains('Closed Medium').should('not.exist');
    cy.contains('Open Low');
    cy.contains('Pending High');
    // Filter by priority high
    cy.get('#priority-high').click();
    cy.contains('Open Low').should('not.exist');
    cy.contains('Pending High');
    cy.get('.grid').children().should('have.length', 1);
    // Clear filters
    cy.get('[data-cy="clear-filters"]').click();
    cy.contains('Open Low');
    cy.contains('Pending High');
    cy.contains('Closed Medium');
  });

  it('persists multiple filters across page reload', () => {
    // Set multiple filters
    cy.visit('/');
    cy.get('#status-open').click();
    cy.get('#priority-low').click();
    cy.get('#category-Bug').click();
    // Reload page
    cy.reload();
    // Check filters still applied
    cy.get('#status-open').should('have.attr', 'aria-checked', 'true');
    cy.get('#priority-low').should('have.attr', 'aria-checked', 'true');
    cy.get('#category-Bug').should('have.attr', 'aria-checked', 'true');
    // Clear and check
    cy.get('[data-cy="clear-filters"]').click();
    cy.get('#status-open').should('have.attr', 'aria-checked', 'false');
    cy.get('#priority-low').should('have.attr', 'aria-checked', 'false');
    cy.get('#category-Bug').should('have.attr', 'aria-checked', 'false');
  });
});