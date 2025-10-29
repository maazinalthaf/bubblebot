// Bubblebot Website Application
class BubblebotWebsite {
    constructor() {
        this.currentPage = 'home';
        this.currentTab = 'miscellaneous';
        this.isSearching = false;
        this.menuOpen = false;

        // Application data
        this.data = {
            "pages": {
                "home": {
                    "hero": {
                        "title": "Bubblebot",
                        "version": "v1.10.1",
                        "subtitle": "Just a simple Discord bot",
                        "description": "A lightweight Discord bot designed for small servers with essential moderation, utility, and fun features."
                    },
                    "features": [
                        {
                            "icon": "🛡️",
                            "title": "Moderation Tools",
                            "description": "Message purging, timeouts, channel locking, and message sniping capabilities"
                        },
                        {
                            "icon": "⚡",
                            "title": "Reaction System",
                            "description": "Automatic emoji reactions to specific words and phrases"
                        },
                        {
                            "icon": "🎭",
                            "title": "Role Management",
                            "description": "Self-assignable roles and comprehensive role administration"
                        },
                        {
                            "icon": "🤖",
                            "title": "Trigger System",
                            "description": "Custom auto-responses to messages for enhanced server interaction"
                        },
                        {
                            "icon": "⚙️",
                            "title": "Server Configuration",
                            "description": "Customizable prefix, command toggling, and server-specific settings"
                        },
                        {
                            "icon": "🔧",
                            "title": "Utility Commands",
                            "description": "AFK status, weather info, calculator, reminders, and more"
                        },
                    ],
                    "prerequisites": [
                        {
                            "name": "Node.js 24",
                            "description": "Latest LTS version of Node.js runtime environment"
                        },
                        {
                            "name": "npm",
                            "description": "Node package manager for dependency installation"
                        },
                        {
                            "name": "Discord Bot Token",
                            "description": "Bot token from Discord Developer Portal"
                        }
                    ],
                    "installation": [
                        
                        {
                            "step": 1,
                            "title": "Clone Repository",
                            "description": "Clone the Bubblebot repository from GitHub",
                            "code": "git clone https://github.com/maazinalthaf/bubblebot.git"
                        },
                        {
                            "step": 2,
                            "title": "Navigate to Directory",
                            "description": "Open terminal and navigate to the bot directory.",
                            "code": "cd bubblebot"
                        },
                        {
                            "step": 3,
                            "title": "Configure Environment",
                            "description": "Rename example.env to .env and insert your bot token.",
                            "code": "mv example.env .env"
                        },
                        {
                            "step": 4,
                            "title": "Upload Emojis",
                            "description": "Upload emojis from /assets to Discord Developer Portal and update IDs in /utils/constants.js ."
                        },
                        {
                            "step": 5,
                            "title": "Install Dependencies",
                            "description": "Install required npm packages.",
                            "code": "npm install"
                        },
                        {
                            "step": 6,
                            "title": "Start the Bot",
                            "description": "Launch Bubblebot.",
                            "code": "npm start"
                        },
                        {
                            "step": 7,
                            "title": "Set Prefix (Optional)",
                            "description": "Default prefix is '.' - can be changed using .setprefix command in discord.",
                            "code": ".setprefix ?"
                        }
                    ]
                }
            },
            "categories": {
                "Miscellaneous": {
                    "description": "General utility commands and fun features",
                    "commands": [
                        {
                            "name": "afk",
                            "aliases": [],
                            "description": "Set yourself as AFK with an optional message",
                            "usage": ".afk &lt;message&gt;",
                            "permissions": "None",
                            "example": ".afk Going to sleep"
                        },
                        {
                            "name": "botinfo",
                            "aliases": [],
                            "description": "Display information about the bot",
                            "usage": ".botinfo",
                            "permissions": "None",
                            "example": ".botinfo"
                        },
                        {
                            "name": "calculator",
                            "aliases": ["calc","math"],
                            "description": "Perform mathematical calculations",
                            "usage": ".calculator &lt;expression&gt;",
                            "permissions": "None",
                            "example": ".calculator 2 + 2"
                        },
                        {
                            "name": "dm",
                            "aliases": [],
                            "description": "Send a direct message to a user",
                            "usage": ".dm @user &lt;message&gt;",
                            "permissions": "Manage Messages",
                            "example": ".dm @moozxdz Hello there!"
                        },
                        {
                            "name": "help",
                            "aliases": ["commands"],
                            "description": "Display help information for commands",
                            "usage": ".help",
                            "permissions": "None",
                            "example": ".help"
                        },
                        {
                            "name": "kanye",
                            "aliases": ["ye"],
                            "description": "Get a random Kanye West quote",
                            "usage": ".kanye",
                            "permissions": "None",
                            "example": ".kanye"
                        },
                        {
                            "name": "ping",
                            "aliases": [],
                            "description": "Check the bot's latency and response time",
                            "usage": ".ping",
                            "permissions": "None",
                            "example": ".ping"
                        },
                        {
                            "name": "remindme",
                            "aliases": ["alarm","remind"],
                            "description": "Set a reminder for a specific time",
                            "usage": ".remindme &lt;time&gt; &lt;message&gt;",
                            "permissions": "None",
                            "example": ".remindme 1h Take a break"
                        },
                        {
                            "name": "removeafk",
                            "aliases": ["rafk"],
                            "description": "Manually remove a user's AFK status",
                            "usage": ".removeafk @user",
                            "permissions": "Administrator",
                            "example": ".removeafk @moozxdz"
                        },
                        {
                            "name": "reply",
                            "aliases": [],
                            "description": "Reply to a specific message",
                            "usage": ".reply &lt;message_id&gt; &lt;response&gt;",
                            "permissions": "None",
                            "example": ".reply 1402463205736845363 Thanks!"
                        },
                        {
                            "name": "say",
                            "aliases": [],
                            "description": "Make the bot send a message",
                            "usage": ".say &lt;message&gt;",
                            "permissions": "Manage Messages",
                            "example": ".say Hello everyone!"
                        },
                        {
                            "name": "weather",
                            "aliases": ["w"],
                            "description": "Get weather information for a location",
                            "usage": ".weather &lt;location&gt;"     ,
                            "permissions": "None",
                            "example": ".weather New York"
                        }
                    ]
                },
                "Moderation": {
                    "description": "Commands for server moderation and management",
                    "commands": [
                        {
                            "name": "purge",
                            "aliases": ["clear", "c"],
                            "description": "Delete a specified number of messages (1-100) from the channel",
                            "usage": ".purge &lt;amount&gt;",
                            "permissions": "Manage Messages",
                            "example": ".purge 10"
                        },
                        {
                            "name": "clearsnipe",
                            "aliases": ["cs", "clearsnipes"],
                            "description": "Clear all sniped messages in the current channel",
                            "usage": ".clearsnipe",
                            "permissions": "Manage Messages",
                            "example": ".clearsnipe"
                        },
                        {
                            "name": "editsnipe",
                            "aliases": ["es"],
                            "description": "View recently edited messages in the channel",
                            "usage": ".editsnipe [number]",
                            "permissions": "Manage Messages",
                            "example": ".editsnipe 2"
                        },
                        {
                            "name": "lock",
                            "aliases": [],
                            "description": "Lock the current channel to prevent members from sending messages",
                            "usage": ".lock",
                            "permissions": "Manage Channels",
                            "example": ".lock"
                        },
                        {
                            "name": "mention",
                            "aliases": [],
                            "description": "Mention a role without mention role permission",
                            "usage": ".mention &lt;rolename&gt;",
                            "permissions": "Manage Messages",
                            "example": ".mention Minecraft"
                        },
                        {
                            "name": "mention add",
                            "aliases": [],
                            "description": "Add a user to use the command for a specific role",
                            "usage": ".mention add @Role @User",
                            "permissions": "Manage Messages",
                            "example": ".mention add @Minecraft @moozxdz"
                        },
                        {
                            "name": "mention remove",
                            "aliases": [],
                            "description": "Remove a user from using the command for a specific role",
                            "usage": ".mention remove @Role @User",
                            "permissions": "Manage Messages",
                            "example": ".mention remove @Minecraft @moozxdz"
                        },
                        {
                            "name": "nick",
                            "aliases": [],
                            "description": "Change a user's nickname",
                            "usage": ".nick @user &lt;nickname&gt;",
                            "permissions": "Manage Nicknames",
                            "example": ".nick @kiff kiffbombo"
                        },
                        {
                            "name": "snipe",
                            "aliases": ["s"],
                            "description": "View recently deleted messages in the channel",
                            "usage": ".snipe [number]",
                            "permissions": "Manage Messages",
                            "example": ".snipe 5"
                        },
                        {
                            "name": "timeout",
                            "aliases": [],
                            "description": "Timeout a user for a specified duration",
                            "usage": ".timeout @user &lt;duration&gt; &lt;optional message&gt;",
                            "permissions": "Moderate Members",
                            "example": ".timeout @moozxdz 1h Spamming"
                        },
                        {
                            "name": "unlock",
                            "aliases": [],
                            "description": "Unlock the current channel to allow members to send messages",
                            "usage": ".unlock",
                            "permissions": "Manage Channels",
                            "example": ".unlock"
                        },
                        {
                            "name": "untimeout",
                            "aliases": [],
                            "description": "Remove timeout from a user",
                            "usage": ".untimeout @user",
                            "permissions": "Moderate Members",
                            "example": ".untimeout @moozxdz"
                        }
                    ]
                },
                "Reaction System": {
                    "description": "Commands to manage automatic emoji reactions",
                    "commands": [
                        {
                            "name": "addreaction",
                            "aliases": ["ar"],
                            "description": "Add automatic emoji reactions to specific words",
                            "usage": ".addreaction &lt;word&gt; &lt;emoji1&gt; [emoji2] [emoji3]",
                            "permissions": "Manage Guild Expressions",
                            "example": ".addreaction hello 👋 😊"
                        },
                        {
                            "name": "listreaction",
                            "aliases": ["lr"],
                            "description": "List all configured automatic reactions with pagination",
                            "usage": ".listreaction",
                            "permissions": "Manage Guild Expressions",
                            "example": ".listreaction"
                        },
                        {
                            "name": "removereaction",
                            "aliases": ["rr"],
                            "description": "Remove automatic reactions from a specific word",
                            "usage": ".removereaction &lt;word&gt;",
                            "permissions": "Manage Guild Expressions",
                            "example": ".removereaction hello"
                        }
                    ]
                },
                "Role Management": {
                    "description": "Commands for managing user roles and permissions",
                    "commands": [
                        {
                            "name": "addrole",
                            "aliases": ["arole", "grole", "giverole"],
                            "description": "Add a role to a user",
                            "usage": ".addrole @user &lt;rolename&gt;",
                            "permissions": "Manage Guild",
                            "example": ".addrole @user Outsider"
                        },
                        {
                            "name": "claim",
                            "aliases": [],
                            "description": "Claim self-assignable roles or view claimable roles list",
                            "usage": ".claim &lt;rolename&gt; for claiming and .claim for list",
                            "permissions": "None",
                            "example": ".claim Minecraft"
                        },
                        {
                            "name": "claim add",
                            "aliases": [],
                            "description": "Add a claimable role to self-assignable roles",
                            "usage": ".claim add &lt;rolename&gt;",
                            "permissions": "Manage Roles",
                            "example": ".claim add Minecraft"
                        },
                        {
                            "name": "claim remove",
                            "aliases": [],
                            "description": "Remove a claimable role from the self-assignable roles list",
                            "usage": ".claim remove &lt;rolename&gt;",
                            "permissions": "Manage Roles",
                            "example": ".claim remove Minecraft"
                        },
                        {
                            "name": "drop",
                            "aliases": [],
                            "description": "Remove self-assignable roles from yourself",
                            "usage": ".drop &lt;rolename&gt;",
                            "permissions": "None",
                            "example": ".drop Minecraft"
                        },
                        {
                            "name": "removerole",
                            "aliases": ["rrole"],
                            "description": "Remove a role from a user",
                            "usage": ".removerole @user &lt;rolename&gt;",
                            "permissions": "Manage Guild",
                            "example": ".removerole @user Outsider"
                        },
                        {
                            "name": "roles",
                            "aliases": [],
                            "description": "Display all roles of a user",
                            "usage": ".roles @user",
                            "permissions": "Manage Roles",
                            "example": ".roles or .roles @moozxdz"
                        }
                    ]
                },
                "Server Configuration": {
                    "description": "Commands for configuring server settings",
                    "commands": [
                        {
                            "name": "listcommand",
                            "aliases": ["lc", "listcommands"],
                            "description": "List all enabled and disabled commands in the server",
                            "usage": ".listcommand",
                            "permissions": "None",
                            "example": ".listcommand"
                        },
                        {
                            "name": "setprefix",
                            "aliases": [],
                            "description": "Set a custom command prefix for the server (max 3 characters)",
                            "usage": ".setprefix &lt;prefix&gt;",
                            "permissions": "Manage Server",
                            "example": ".setprefix ?"
                        },
                        {
                            "name": "togglecommand",
                            "aliases": ["tc"],
                            "description": "Enable or disable specific commands for the server",
                            "usage": ".togglecommand &lt;command&gt;",
                            "permissions": "Manage Server",
                            "example": ".togglecommand ping"
                        }
                    ]
                },
                "Trigger System": {
                    "description": "Commands for managing automatic text responses",
                    "commands": [
                        {
                            "name": "addtrigger",
                            "aliases": ["at"],
                            "description": "Add an auto-response trigger (supports multiple words in quotes)",
                            "usage": ".addtrigger \"&lt;trigger&gt;\" &lt;response&gt;",
                            "permissions": "Manage Messages",
                            "example": ".addtrigger \"hello there\" \"Hi! How can I help?\""
                        },
                        {
                            "name": "listtrigger",
                            "aliases": ["lt"],
                            "description": "List all auto-response triggers with pagination",
                            "usage": ".listtrigger",
                            "permissions": "Manage Messages",
                            "example": ".listtrigger"
                        },
                        {
                            "name": "removetrigger",
                            "aliases": ["rt"],
                            "description": "Remove an auto-response trigger (supports multi-word triggers in quotes)",
                            "usage": ".removetrigger \"&lt;trigger&gt;\"",
                            "permissions": "Manage Messages",
                            "example": ".removetrigger \"hello there\""
                        }
                    ]
                }
            }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderHomeContent();
        this.renderAllCommands();
    }

    setupEventListeners() {
        // Hamburger menu
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const menuOverlay = document.getElementById('menuOverlay');
        
        if (hamburgerBtn) {
            hamburgerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMenu();
            });
        }
        
        if (menuOverlay) {
            menuOverlay.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeMenu();
            });
        }

        // Navigation menu items
        const navMenuItems = document.querySelectorAll('.nav-menu-item[data-page]');
        navMenuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const page = e.currentTarget.dataset.page;
                this.navigateToPage(page);
                this.closeMenu();
            });
        });

        // View Commands button on home page
        const viewCommandsBtn = document.getElementById('viewCommandsBtn');
        if (viewCommandsBtn) {
            viewCommandsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.navigateToPage('commands');
            });
        }

        // Tab switching in commands page
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = e.currentTarget.dataset.tab;
                this.switchTab(tabId);
            });
        });

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Copy functionality (delegated event handling)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('copy-btn') || e.target.closest('.copy-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const copyBtn = e.target.classList.contains('copy-btn') ? e.target : e.target.closest('.copy-btn');
                const usage = copyBtn.dataset.usage;
                this.copyToClipboard(usage);
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.menuOpen) {
                this.closeMenu();
            }
        });

        // Prevent default on all button clicks to avoid blue dots
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                e.preventDefault();
            }
        });
    }

    // Navigation Methods
    toggleMenu() {
        this.menuOpen = !this.menuOpen;
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const navMenu = document.getElementById('navMenu');
        const menuOverlay = document.getElementById('menuOverlay');

        if (this.menuOpen) {
            hamburgerBtn.classList.add('active');
            navMenu.classList.remove('hidden');
            menuOverlay.classList.remove('hidden');
            // Force reflow
            navMenu.offsetHeight;
            menuOverlay.offsetHeight;
            setTimeout(() => {
                navMenu.classList.add('show');
                menuOverlay.classList.add('show');
            }, 10);
        } else {
            this.closeMenu();
        }
    }

    closeMenu() {
        if (!this.menuOpen) return;
        
        this.menuOpen = false;
        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const navMenu = document.getElementById('navMenu');
        const menuOverlay = document.getElementById('menuOverlay');

        hamburgerBtn.classList.remove('active');
        navMenu.classList.remove('show');
        menuOverlay.classList.remove('show');

        setTimeout(() => {
            navMenu.classList.add('hidden');
            menuOverlay.classList.add('hidden');
        }, 300);
    }

    navigateToPage(pageName) {
        console.log('Navigating to page:', pageName);
        
        // Update active page
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        const targetPage = document.getElementById(pageName);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Update navigation menu
        document.querySelectorAll('.nav-menu-item[data-page]').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`[data-page="${pageName}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        this.currentPage = pageName;

        // Clear search when navigating to commands
        if (pageName === 'commands' && this.isSearching) {
            this.clearSearch();
        }
    }

    // Home Page Content Rendering
    renderHomeContent() {
        this.renderFeatures();
        this.renderPrerequisites();
        this.renderInstallation();
    }

    renderFeatures() {
        const featuresGrid = document.getElementById('featuresGrid');
        if (!featuresGrid) return;

        const featuresHtml = this.data.pages.home.features.map(feature => `
            <div class="feature-card">
                <span class="feature-icon">${feature.icon}</span>
                <h3 class="feature-title">${feature.title}</h3>
                <p class="feature-description">${feature.description}</p>
            </div>
        `).join('');

        featuresGrid.innerHTML = featuresHtml;
    }

    renderPrerequisites() {
        const prerequisitesGrid = document.getElementById('prerequisitesGrid');
        if (!prerequisitesGrid) return;

        const prerequisitesHtml = this.data.pages.home.prerequisites.map((prerequisite, index) => `
            <div class="prerequisite-card">
                <div class="prerequisite-icon">${index + 1}</div>
                <div class="prerequisite-content">
                    <h4>${prerequisite.name}</h4>
                    <p>${prerequisite.description}</p>
                </div>
            </div>
        `).join('');

        prerequisitesGrid.innerHTML = prerequisitesHtml;
    }

    renderInstallation() {
        const installationSteps = document.getElementById('installationSteps');
        if (!installationSteps) return;

        const stepsHtml = this.data.pages.home.installation.map(step => `
            <div class="installation-step">
                <div class="step-number">${step.step}</div>
                <h3 class="step-title">${step.title}</h3>
                <p class="step-description">${step.description}</p>
                ${step.code ? `<div class="step-code">${step.code}</div>` : ''}
            </div>
        `).join('');

        installationSteps.innerHTML = stepsHtml;
    }

    // Commands Page Methods
    switchTab(tabId) {
        if (this.isSearching) {
            this.clearSearch();
        }

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeTabBtn = document.querySelector(`[data-tab="${tabId}"]`);
        if (activeTabBtn) {
            activeTabBtn.classList.add('active');
        }

        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        const activePanel = document.getElementById(tabId);
        if (activePanel) {
            activePanel.classList.add('active');
        }

        this.currentTab = tabId;
    }

    handleSearch(query) {
        const searchResultsPanel = document.getElementById('search-results');
        const searchResultsGrid = document.getElementById('searchResultsGrid');

        if (!query.trim()) {
            this.clearSearch();
            return;
        }

        this.isSearching = true;

        // Hide all other panels and show search results
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        searchResultsPanel.classList.remove('hidden');
        searchResultsPanel.classList.add('active');

        // Remove active state from all tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Search through all commands
        const results = this.searchCommands(query);
        this.renderSearchResults(results, searchResultsGrid);
    }

    searchCommands(query) {
        const results = [];
        const searchTerm = query.toLowerCase().trim();

        Object.entries(this.data.categories).forEach(([categoryName, category]) => {
            category.commands.forEach(command => {
                // Create searchable text from all command properties
                const searchableFields = [
                    command.name,
                    ...command.aliases,
                    command.description,
                    command.usage,
                    command.example
                ];
                
                const searchableText = searchableFields.join(' ').toLowerCase();

                // Check if any field matches the search term
                if (searchableText.includes(searchTerm)) {
                    results.push({
                        ...command,
                        category: categoryName
                    });
                }
            });
        });

        return results;
    }

    renderSearchResults(results, container) {
        if (results.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <h3>No commands found</h3>
                    <p>Try adjusting your search terms or browse the categories above.</p>
                </div>
            `;
            return;
        }

        const resultsHtml = results.map(command => this.createCommandCard(command)).join('');
        container.innerHTML = resultsHtml;
    }

    clearSearch() {
        this.isSearching = false;
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        
        const searchResultsPanel = document.getElementById('search-results');
        if (searchResultsPanel) {
            searchResultsPanel.classList.remove('active');
            searchResultsPanel.classList.add('hidden');
        }
        
        // Restore the previous active tab
        const currentTabPanel = document.getElementById(this.currentTab);
        const currentTabBtn = document.querySelector(`[data-tab="${this.currentTab}"]`);
        
        if (currentTabPanel) {
            currentTabPanel.classList.add('active');
        }
        if (currentTabBtn) {
            currentTabBtn.classList.add('active');
        }
    }

    renderAllCommands() {
        Object.entries(this.data.categories).forEach(([categoryName, category]) => {
            const categoryKey = categoryName.toLowerCase().replace(/\s+/g, '-');
            const grid = document.getElementById(`${categoryKey}Grid`);
            
            if (grid) {
                const commandsHtml = category.commands.map(command => 
                    this.createCommandCard(command)
                ).join('');
                grid.innerHTML = commandsHtml;
            }
        });
    }

    createCommandCard(command) {
        const permissionClass = command.permissions === 'None' ? 'none' : 
                               (command.permissions.includes('Manage Guild') || 
                                command.permissions.includes('Administrator') ||
                                command.permissions.includes('Moderate Members')) ? 'admin' : '';

        const aliasesHtml = command.aliases && command.aliases.length > 0 ? `
            <div class="command-aliases">
                <div class="aliases-label">Aliases:</div>
                ${command.aliases.map(alias => `<span class="alias-tag">.${alias}</span>`).join('')}
            </div>
        ` : '';

        const categoryBadge = command.category ? `
            <span class="category-badge">${command.category}</span>
        ` : '';

        // Properly escape the usage string for HTML attributes
        const escapedUsage = command.usage.replace(/"/g, '&quot;').replace(/'/g, '&#39;');

        return `
            <div class="command-card">
                <div class="command-header">
                    <div class="command-title-section">
                        <h3 class="command-name">.${command.name}</h3>
                        ${categoryBadge}
                    </div>
                    <button class="copy-btn" data-usage="${escapedUsage}" title="Copy command">
                        📋 Copy
                    </button>
                </div>
                
                ${aliasesHtml}
                
                <p class="command-description">${command.description}</p>
                
                <div class="command-meta">
                    <span class="permission-badge ${permissionClass}">
                        ${command.permissions}
                    </span>
                </div>
                
                <div class="command-usage">
                    <div class="usage-label">Usage:</div>
                    <code class="usage-code">${command.usage}</code>
                </div>
                
                <div class="command-example">
                    <div class="example-label">Example:</div>
                    <code class="example-code">${command.example}</code>
                </div>
            </div>
        `;
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Command copied to clipboard!');
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                this.showToast('Command copied to clipboard!');
            } catch (err) {
                this.showToast('Failed to copy command');
            }
            
            document.body.removeChild(textArea);
        }
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        const toastText = toast.querySelector('.toast-text');
        
        if (toast && toastText) {
            toastText.textContent = message;
            toast.classList.remove('hidden');
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    toast.classList.add('hidden');
                }, 300);
            }, 3000);
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BubblebotWebsite();
});

// Get the home link element
const homeLink = document.getElementById('homeLink');

homeLink.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Add click animation
    const logo = document.querySelector('.brand-logo');
    logo.classList.add('brand-animate');
    
    // Remove animation after it completes
    setTimeout(() => {
        logo.classList.remove('brand-animate');
    }, 400);
    
    // Close mobile menu if open
    document.getElementById('navMenu').classList.add('hidden');
    document.getElementById('menuOverlay').classList.add('hidden');
    document.getElementById('hamburgerBtn').classList.remove('active');
    
    // Switch to home page with smooth transition
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    setTimeout(() => {
        document.getElementById('home').classList.add('active');
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, 200);
    
    // Update active nav item
    document.querySelectorAll('.nav-menu-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector('.nav-menu-item[data-page="home"]').classList.add('active');
});

function createParticles() {
  const particlesContainer = document.createElement('div');
  particlesContainer.className = 'particles';
  document.querySelector('.hero').appendChild(particlesContainer);
  
  for (let i = 0; i < 100; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random properties
    const size = Math.random() * 8 + 4;
    const posX = Math.random() * 100;
    const delay = Math.random() * 100;
    const duration = Math.random() * 5+3;
    
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${posX}%`;
    particle.style.animationDelay = `${delay}ms`;
    particle.style.animationDuration = `${duration}s`;
    particle.style.setProperty('--random-x', `${Math.random() * 100 - 50}px`);
    
    particlesContainer.appendChild(particle);
  }
}

document.addEventListener('DOMContentLoaded', createParticles);