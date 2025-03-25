/**
 * Knowledge Base Module
 * Handles interaction with Supabase to store and retrieve game information
 */

if (typeof window.KnowledgeBase === 'undefined') {
  class KnowledgeBase {
    constructor() {
      // Supabase configuration
      this.supabaseUrl = 'https://mksrmkpqvgnkfmxxdijs.supabase.co';
      this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rc3Jta3Bxdmdua2ZteHhkaWpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMjIzMzUsImV4cCI6MjA1NjY5ODMzNX0.cV-J-sd6HuKKSv-wz1QfR_g4wbXzWj1ZYKKoUMHRj50';
      
      // Initialize Supabase client
      this.supabase = null;
      
      // Knowledge categories
      this.categories = {
        GAME_MECHANICS: 'game_mechanics',
        CHARACTERS: 'characters',
        LOCATIONS: 'locations',
        ITEMS: 'items',
        ABILITIES: 'abilities'
      };
      
      // Cache for retrieved knowledge
      this.cache = {
        game_mechanics: {
          // Core game mechanics
          core: {
            name: "Core Game Systems",
            description: "Primary game systems that define the Adventure game experience",
            combat: {
              type: "real-time action combat",
              description: "Characters automatically engage with nearby monsters, using different animations based on weapon type.",
              mechanics: [
                "Characters move towards the nearest monster and attack automatically",
                "Attack animations vary by weapon type (melee, ranged, magic)",
                "Combat uses stats including damage, attack speed, defense, and various resistances",
                "Critical hits and evasion are percentage-based chances"
              ]
            },
            leveling: {
              description: "Characters gain experience and level up to increase their power",
              mechanics: [
                "Experience is earned by defeating monsters",
                "Level-ups increase base stats (strength, agility, vitality, dexterity, intelligence, luck)",
                "Each level requires more experience than the previous one",
                "Character level is displayed on their portrait and in the character panel"
              ]
            },
            inventory: {
              description: "System for storing and managing items",
              features: [
                "Items are categorized as weapons, armor, accessories, consumables, etc.",
                "Equipment affects character stats",
                "Stackable items like consumables can be used from inventory",
                "Inventory is organized with tabs for different item categories"
              ]
            },
            gacha: {
              description: "Character acquisition system",
              types: [
                "Mortal DNA (basic units, uses copper currency)",
                "Synthetic DNA (enhanced units, uses silver currency)",
                "Divine DNA (transcendent entities, uses gold currency)"
              ],
              mechanics: [
                "Different pull rates based on rarity (Common, Uncommon, Rare, Epic, Legendary)",
                "Duplicate characters provide character shards for upgrades",
                "Pull animation with visual effects and results display"
              ]
            },
            currency: {
              description: "Multiple currency types used for different purposes",
              types: [
                "Copper (₵) - Basic currency for common items and Mortal DNA pulls",
                "Silver (Ⓢ) - Mid-tier currency for better items and Synthetic DNA pulls",
                "Gold (Ⓖ) - Premium currency for high-tier items and Divine DNA pulls",
                "Diamond (◈) - Special currency for exclusive items and features"
              ]
            },
            map: {
              description: "Game world exploration system",
              mechanics: [
                "Auto-scrolling background with distance tracking",
                "Character positioning in different 'lanes'",
                "Monster spawning based on current map section",
                "Different map backgrounds for various locations"
              ]
            },
            equipment: {
              description: "System for equipping items to enhance character stats",
              slots: [
                "Right Hand - Primary weapons",
                "Left Hand - Shields or dual-wield weapons",
                "Armor - Body protection",
                "Gloves - Hand equipment",
                "Boots - Foot equipment", 
                "Accessory 1 & 2 - Rings, necklaces, amulets, etc."
              ],
              effects: "Equipment provides stat bonuses and sometimes special effects"
            },
            buffs: {
              description: "Temporary enhancements to character performance",
              examples: [
                "2x DMG - Doubles damage output",
                "2x SPD - Doubles attack speed"
              ]
            },
            dungeons: {
              description: "Special areas with enhanced challenges and rewards",
              features: [
                "Unique enemies and bosses",
                "Themed environments",
                "Special rewards upon completion",
                "Background music specific to each dungeon"
              ]
            }
          }
        },
        
        characters: {
          // Character information
          devin: {
            name: "Devin",
            description: "Initial character provided to new players",
            sprites: {
              idle: "img/devinidle.png",
              attack: "img/devinattack.png",
              run: "img/devinrun.png",
              sit: "img/devinsit.png",
              magic: "img/devinmagic.png",
              ranged: "img/devinranged.png"
            },
            stats: {
              baseStats: {
                strength: 1,
                agility: 1,
                vitality: 1, 
                dexterity: 1,
                intelligence: 1,
                luck: 1
              },
              derivedStats: {
                hp: "150 + (vitality * 10)",
                sp: "50 + (intelligence * 5)",
                damage: "50 + (strength * 5)",
                magicDamage: "50 + (intelligence * 5)",
                rangeDamage: "50 + (dexterity * 5)",
                attackSpeed: "1.0 + (agility * 0.02)",
                defense: "50 + (vitality * 3)",
                magicDefense: "50 + (intelligence * 3)",
                hit: "5 + (dexterity * 0.5)",
                evasion: "5 + (agility * 0.5) + (luck * 0.2)",
                critical: "5 + (luck * 0.5)"
              }
            },
            specialAbility: "Time Warp",
            rarity: "common"
          },
          
          chad: {
            name: "Chad",
            description: "Character with balanced stats, good for beginners",
            sprites: {
              idle: "img/chadidle.png",
              attack: "img/chadattack.png",
              run: "img/chadrun.png",
              sit: "img/chadsit.png",
              magic: "img/chadmagic.png",
              ranged: "img/chadranged.png"
            },
            stats: {
              baseStats: {
                strength: 3,
                agility: 2,
                vitality: 3,
                dexterity: 2,
                intelligence: 2,
                luck: 2
              }
            },
            rarity: "uncommon"
          },
          
          gowdie: {
            name: "Gowdie",
            description: "Character focused on strength and defense",
            sprites: {
              idle: "img/gowdieidle.png",
              attack: "img/gowdieattack.png",
              sit: "img/gowdiesit.png",
              magic: "img/gowdiemagic.png",
              ranged: "img/gowdieranged.png"
            },
            stats: {
              baseStats: {
                strength: 4,
                agility: 1,
                vitality: 5,
                dexterity: 2,
                intelligence: 1,
                luck: 1
              }
            },
            rarity: "rare"
          },
          
          lovelace: {
            name: "Lovelace",
            description: "Character specialized in magic abilities",
            sprites: {
              attack: "img/lovelace_attack.png",
              run: "img/lovelace_run.png"
            },
            stats: {
              baseStats: {
                strength: 1,
                agility: 2,
                vitality: 2,
                dexterity: 3,
                intelligence: 5,
                luck: 2
              }
            },
            rarity: "rare"
          }
        },
        
        locations: {
          // Location information
          neon_district: {
            name: "Neon District",
            description: "A vibrant urban area filled with bright lights and holographic advertisements",
            background: "img/neon_district.png",
            music: "music/neon_district.mp3",
            enemies: "Common street thugs and basic robotic enemies",
            loot: "Basic equipment and common materials"
          },
          
          corporate_plaza: {
            name: "Corporate Plaza",
            description: "A sleek business district dominated by towering corporate headquarters",
            background: "img/corporate_plaza.png",
            music: "music/corporate_plaza.mp3",
            enemies: "Corporate security and advanced security drones",
            loot: "Uncommon corporate tech and business attire equipment"
          },
          
          data_nexus: {
            name: "Data Nexus",
            description: "A digital realm where information flows in visible streams",
            background: "img/data_nexus.png",
            music: "music/data_nexus.mp3",
            enemies: "Digital constructs and information guardians",
            loot: "Rare data-based items and intelligence-boosting equipment"
          },
          
          quantum_void: {
            name: "Quantum Void",
            description: "A mysterious area where reality itself seems to shift and flux",
            background: "img/quantum_void.png",
            music: "music/quantum_void.mp3",
            enemies: "Reality warpers and interdimensional beings",
            loot: "Epic and legendary quantum-infused equipment"
          },
          
          love_city: {
            name: "Love City",
            description: "A charming district filled with boutiques and cafes",
            background: "img/love_city.png",
            music: "music/lovecity.mp3",
            enemies: "Fashion obsessed individuals and mechanized pet companions",
            loot: "Stylish accessories and charm-enhancing items"
          },
          
          cyber_slums: {
            name: "Cyber Slums",
            description: "The underbelly of the city where discarded tech finds new purpose",
            background: "img/cyber_slums.png",
            enemies: "Scrappy gangs and repurposed junk robots",
            loot: "Scrap metal and surprisingly powerful jury-rigged equipment"
          }
        },
        
        items: {
          // Item information - weapons
          cyber_blade: {
            name: "Cyber Blade",
            category: "weapon",
            equipmentType: "sword",
            rarity: "uncommon",
            description: "A sharp blade with neon edges.",
            stats: {
              damage: 15,
              attackSpeed: 1.2
            },
            effects: ["Deals 5 bonus damage to robotic enemies"],
            icon: "img/items/cyber_blade.png"
          },
          
          quantum_dagger: {
            name: "Quantum Dagger",
            category: "weapon",
            equipmentType: "dagger",
            rarity: "rare",
            description: "A dagger that can phase through armor.",
            stats: {
              damage: 12,
              attackSpeed: 1.5,
              critical: 10
            },
            effects: ["15% chance to ignore target defense"]
          },
          
          pulse_bow: {
            name: "Pulse Bow",
            category: "weapon",
            equipmentType: "bow",
            rarity: "rare",
            description: "A bow that fires concentrated energy pulses.",
            stats: {
              damage: 18,
              attackSpeed: 1.0,
              range: 200
            },
            effects: ["Arrows penetrate through up to 3 targets"]
          },
          
          data_staff: {
            name: "Data Staff",
            category: "weapon",
            equipmentType: "staff",
            rarity: "rare",
            description: "A staff channeling digital energies.",
            stats: {
              magicDamage: 25,
              attackSpeed: 0.8,
              intelligence: 10
            },
            effects: ["Spells cost 15% less energy"]
          },
          
          neon_katana: {
            name: "Neon Katana",
            category: "weapon",
            equipmentType: "katana",
            rarity: "epic",
            description: "A razor-sharp blade with neon edge technology.",
            stats: {
              damage: 22,
              attackSpeed: 1.2,
              critical: 12
            },
            effects: ["Critical hits cause bleeding for 3 seconds"]
          },
          
          plasma_pistol: {
            name: "Plasma Pistol",
            category: "weapon",
            rarity: "rare",
            description: "A pistol that fires concentrated plasma bolts.",
            stats: {
              damage: 20,
              attackSpeed: 1.0,
              range: 150
            },
            effects: ["20% chance to apply a burn effect"],
            icon: "img/items/plasma_pistol.png"
          },
          
          // Item information - armor and defensive items
          synth_vest: {
            name: "Synthetic Vest",
            category: "armor",
            equipmentType: "light_armor",
            rarity: "common",
            description: "Basic protection made from synthetic fibers.",
            stats: {
              defense: 10,
              hp: 20
            },
            icon: "img/items/synth_vest.png"
          },
          
          nano_armor: {
            name: "Nano Armor",
            category: "armor",
            equipmentType: "medium_armor",
            rarity: "rare",
            description: "Armor made from nanobots that adapt to damage.",
            stats: {
              defense: 25,
              hp: 50,
              magicDefense: 15
            },
            effects: ["Regenerates 1 HP per second"],
            icon: "img/items/nano_armor.png"
          },
          
          quantum_shield: {
            name: "Quantum Shield",
            category: "armor",
            equipmentType: "shield",
            rarity: "legendary",
            description: "A shield that exists in multiple dimensions simultaneously.",
            stats: {
              defense: 50,
              hp: 100,
              magicDefense: 50,
              evasion: 10
            },
            effects: ["15% chance to completely negate damage"],
            icon: "img/items/quantum_shield.png"
          },
          
          // Item information - accessories
          neural_implant: {
            name: "Neural Implant",
            category: "accessory",
            equipmentType: "ring",
            rarity: "uncommon",
            description: "An implant that enhances cognitive functions.",
            stats: {
              intelligence: 10,
              magicDamage: 15
            },
            effects: ["Reduces skill cooldowns by 10%"],
            icon: "img/items/neural_implant.png"
          },
          
          reflex_booster: {
            name: "Reflex Booster",
            category: "accessory",
            equipmentType: "bracelet",
            rarity: "rare",
            description: "A device that enhances reflexes and reaction time.",
            stats: {
              agility: 15,
              attackSpeed: 0.2,
              evasion: 5
            },
            effects: ["20% chance to dodge attacks"],
            icon: "img/items/reflex_booster.png"
          },
          
          chrono_amulet: {
            name: "Chrono Amulet",
            category: "accessory",
            equipmentType: "amulet",
            rarity: "legendary",
            description: "An amulet that manipulates the flow of time.",
            stats: {
              attackSpeed: 0.5,
              cooldownReduction: 25,
              evasion: 15
            },
            effects: ["5% chance to reset skill cooldowns after use"],
            icon: "img/items/chrono_amulet.png"
          },
          
          // Item information - consumables
          health_stim: {
            name: "Health Stimulator",
            category: "consumable",
            rarity: "common",
            description: "A stimulant that restores health.",
            effects: ["Restores 50 HP"],
            icon: "img/items/health_stim.png",
            stackable: true,
            maxStack: 10
          },
          
          energy_drink: {
            name: "Neon Energy Drink",
            category: "consumable",
            rarity: "uncommon",
            description: "A drink that temporarily boosts energy and reflexes.",
            effects: ["Increases attack speed by 50% for 30 seconds"],
            icon: "img/items/energy_drink.png",
            stackable: true,
            maxStack: 5
          },
          
          nano_repair: {
            name: "Nano Repair Kit",
            category: "consumable",
            rarity: "rare",
            description: "A kit that deploys nanobots to repair damage over time.",
            effects: ["Restores 10 HP per second for 10 seconds"],
            icon: "img/items/nano_repair.png",
            stackable: true,
            maxStack: 3
          }
        },
        
        abilities: {
          // Ability information - melee abilities
          power_strike: {
            name: "Power Strike",
            type: "melee",
            description: "A powerful strike that deals 150% damage.",
            cooldown: 5,
            energyCost: 10,
            damageMultiplier: 1.5,
            range: 10
          },
          
          whirlwind: {
            name: "Whirlwind",
            type: "melee",
            description: "Spin and hit all enemies within range for 120% damage.",
            cooldown: 8,
            energyCost: 15,
            damageMultiplier: 1.2,
            range: 50,
            aoe: true
          },
          
          // Ability information - ranged abilities
          precision_shot: {
            name: "Precision Shot",
            type: "ranged",
            description: "A precise shot that deals 180% damage and has a 20% chance to critically hit.",
            cooldown: 6,
            energyCost: 12,
            damageMultiplier: 1.8,
            critChance: 0.2,
            critMultiplier: 2.0,
            range: 900  // Updated to match new range
          },
          
          multi_shot: {
            name: "Multi Shot",
            type: "ranged",
            description: "Fire multiple shots at up to 3 targets for 100% damage each.",
            cooldown: 10,
            energyCost: 18,
            damageMultiplier: 1.0,
            maxTargets: 3,
            range: 900,  // Updated to match new range
            aoe: true
          },
          
          // Ability information - magic abilities
          cyber_blast: {
            name: "Cyber Blast",
            type: "magic",
            description: "A blast of cyber energy that deals 200% magic damage.",
            cooldown: 7,
            energyCost: 20,
            damageMultiplier: 2.0,
            range: 900  // Updated to match new range
          },
          
          neural_overload: {
            name: "Neural Overload",
            type: "magic",
            description: "Overload enemy neural systems, dealing 150% magic damage and stunning for 2 seconds.",
            cooldown: 12,
            energyCost: 25,
            damageMultiplier: 1.5,
            stunDuration: 2,
            range: 900  // Updated to match new range
          },
          
          // Ability information - buff abilities
          overclock: {
            name: "Overclock",
            type: "buff",
            description: "Overclock your systems, increasing attack speed by 50% for 10 seconds.",
            cooldown: 20,
            energyCost: 15,
            duration: 10,
            statBoosts: {
              attackSpeed: 0.5
            }
          },
          
          nano_shield: {
            name: "Nano Shield",
            type: "buff",
            description: "Deploy a shield of nanobots, reducing damage taken by 30% for 8 seconds.",
            cooldown: 25,
            energyCost: 20,
            duration: 8,
            damageReduction: 0.3
          },
          
          // Ability information - healing abilities
          repair_protocol: {
            name: "Repair Protocol",
            type: "heal",
            description: "Activate repair protocols, healing for 30% of max HP.",
            cooldown: 15,
            energyCost: 25,
            healPercent: 0.3
          },
          
          // Ability information - special abilities
          time_warp: {
            name: "Time Warp",
            type: "utility",
            description: "Manipulate time, reducing all cooldowns by 50% for 8 seconds.",
            cooldown: 45,
            energyCost: 40,
            duration: 8,
            cooldownReduction: 0.5,
            characterSpecific: "Devin"
          },
          
          neural_hack: {
            name: "Neural Hack",
            type: "debuff",
            description: "Hack into enemy systems, reducing their attack and defense by 40% for 6 seconds.",
            cooldown: 40,
            energyCost: 35,
            duration: 6,
            statReductions: {
              damage: 0.4,
              defense: 0.4
            },
            range: 100
          }
        }
      };
    }

    /**
     * Initialize the knowledge base
     */
    async initialize() {
      try {
        // Attempt to load Supabase client script
        await this.loadSupabaseScript();
        
        // Initialize Supabase client if the script loaded
        if (window.supabase) {
          this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);
          
          // Create tables if they don't exist
          await this.setupDatabase();
          
          console.log('Knowledge base initialized with Supabase connection');
        } else {
          console.log('Using in-memory cache only (Supabase not available)');
        }
        
        // Ensure we have the complete knowledge loaded in the cache
        this.setupInitialKnowledge();
        
        return true;
      } catch (error) {
        console.error('Failed to initialize Supabase connection:', error);
        console.log('Continuing with in-memory cache only');
        
        // Ensure we have the complete knowledge loaded in the cache
        this.setupInitialKnowledge();
        
        return true;
      }
    }
    
    /**
     * Load Supabase client script
     */
    async loadSupabaseScript() {
      return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.supabase) {
          resolve();
          return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = () => resolve();
        script.onerror = (error) => {
          console.error('Error loading Supabase script:', error);
          reject(error);
        };
        document.head.appendChild(script);
      });
    }

    /**
     * Set up database tables if they don't exist
     */
    async setupDatabase() {
      try {
        // Check if Supabase client is available
        if (!this.supabase) {
          console.warn('Supabase client not available');
          return;
        }

        // These are the SQL queries that would be executed
        const createTablesQueries = [
          `CREATE TABLE IF NOT EXISTS game_mechanics (
            id SERIAL PRIMARY KEY,
            key TEXT UNIQUE NOT NULL,
            data JSONB NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
          )`,
          `CREATE TABLE IF NOT EXISTS characters (
            id SERIAL PRIMARY KEY,
            key TEXT UNIQUE NOT NULL,
            data JSONB NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
          )`,
          `CREATE TABLE IF NOT EXISTS locations (
            id SERIAL PRIMARY KEY,
            key TEXT UNIQUE NOT NULL,
            data JSONB NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
          )`,
          `CREATE TABLE IF NOT EXISTS items (
            id SERIAL PRIMARY KEY,
            key TEXT UNIQUE NOT NULL,
            data JSONB NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
          )`,
          `CREATE TABLE IF NOT EXISTS abilities (
            id SERIAL PRIMARY KEY,
            key TEXT UNIQUE NOT NULL,
            data JSONB NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
          )`
        ];
        
        console.log('Supabase tables would be created with these queries:', createTablesQueries);
      } catch (error) {
        console.error('Error setting up database:', error);
      }
    }

    /**
     * Set up initial knowledge in the cache
     */
    setupInitialKnowledge() {
      // This is already done in the constructor, but we call it explicitly here
      // to ensure it's available even if we bypassed the constructor somehow
      console.log('Initial knowledge loaded into cache');
    }

    /**
     * Store knowledge in the database
     * @param {string} category - Knowledge category
     * @param {string} key - Unique identifier for the knowledge
     * @param {Object} data - Knowledge data to store
     */
    async storeKnowledge(category, key, data) {
      // Always store in local cache first
      if (!this.cache[category]) this.cache[category] = {};
      this.cache[category][key] = data;
      
      try {
        // Store in Supabase if available
        if (this.supabase) {
          // Example Supabase query - upsert pattern
          const { error } = await this.supabase
            .from(category)
            .upsert({ 
              key: key,
              data: data
            }, { 
              onConflict: 'key',
              returning: 'minimal'
            });
            
          if (error) throw error;
        }
        
        console.log(`Stored knowledge: ${category}/${key}`);
        return true;
      } catch (error) {
        console.error(`Error storing knowledge in Supabase: ${category}/${key}`, error);
        // We still return true since the data is in the cache
        return true;
      }
    }

    /**
     * Retrieve knowledge from the database
     * @param {string} category - Knowledge category to query
     * @param {string} key - Specific key to retrieve (optional)
     * @returns {Object|Array} - Retrieved knowledge
     */
    async getKnowledge(category, key = null) {
      // Check cache first
      if (this.cache[category]) {
        if (key && this.cache[category][key]) {
          return this.cache[category][key];
        } else if (!key && Object.keys(this.cache[category]).length > 0) {
          return this.cache[category];
        }
      }
      
      // If not in cache and we have Supabase available
      try {
        if (this.supabase) {
          let query = this.supabase.from(category);
          
          if (key) {
            // Query for specific key
            const { data, error } = await query
              .select('data')
              .eq('key', key)
              .single();
            
            if (error) throw error;
            
            if (data) {
              // Cache the result
              if (!this.cache[category]) this.cache[category] = {};
              this.cache[category][key] = data.data;
              return data.data;
            }
          } else {
            // Query for all items in category
            const { data, error } = await query
              .select('key, data');
            
            if (error) throw error;
            
            if (data && data.length > 0) {
              // Convert to object format and cache
              const result = {};
              if (!this.cache[category]) this.cache[category] = {};
              
              data.forEach(item => {
                result[item.key] = item.data;
                this.cache[category][item.key] = item.data;
              });
              
              return result;
            }
          }
        }
        
        // Fallback to empty result if not found
        return key ? null : {};
      } catch (error) {
        console.error('Error retrieving knowledge from Supabase:', error);
        // Return what we have in cache, or empty result
        return key ? null : {};
      }
    }

    /**
     * Search knowledge base
     * @param {string} query - Search query
     * @returns {Array} - Search results
     */
    async searchKnowledge(query) {
      try {
        // Enhanced search implementation
        const results = [];
        const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 2);
        
        // Search through cache
        for (const category in this.cache) {
          for (const key in this.cache[category]) {
            const data = this.cache[category][key];
            const dataStr = JSON.stringify(data).toLowerCase();
            
            // Simple keyword matching
            let matches = false;
            let relevance = 0;
            
            // If no keywords, use the whole query
            if (keywords.length === 0) {
              if (dataStr.includes(query.toLowerCase())) {
                matches = true;
                relevance += 1;
              }
            } else {
              // Check each keyword
              for (const keyword of keywords) {
                if (dataStr.includes(keyword)) {
                  matches = true;
                  relevance += 1;
                  
                  // Boost relevance if key matches directly
                  if (key.toLowerCase().includes(keyword)) {
                    relevance += 3;
                  }
                  
                  // Boost relevance if name matches
                  if (data.name && data.name.toLowerCase().includes(keyword)) {
                    relevance += 2;
                  }
                }
              }
            }
            
            if (matches) {
              results.push({
                category,
                key,
                data,
                relevance
              });
            }
          }
        }
        
        // Sort by relevance
        results.sort((a, b) => b.relevance - a.relevance);
        
        // Return top results (limited to 10)
        return results.slice(0, 10);
      } catch (error) {
        console.error('Error searching knowledge:', error);
        return [];
      }
    }

    /**
     * Scrape game information from the page
     * This method analyzes the current page and extracts relevant game information
     */
    async scrapeGameInfo() {
      try {
        // Get all script tags
        const scripts = document.querySelectorAll('script:not([src])');
        const scriptTexts = Array.from(scripts).map(script => script.textContent);
        
        // Extract information from the scripts
        await this.extractGameMechanics(scriptTexts);
        await this.extractCharacterInfo(scriptTexts);
        await this.extractLocationsInfo(scriptTexts);
        await this.extractItemsInfo(scriptTexts);
        await this.extractAbilitiesInfo(scriptTexts);
        
        console.log('Game information scraped successfully');
        return true;
      } catch (error) {
        console.error('Error scraping game information:', error);
        return false;
      }
    }

    /**
     * Extract game mechanics information from scripts
     * @param {Array} scriptTexts - Array of script content
     */
    async extractGameMechanics(scriptTexts) {
      // The updated knowledge base already contains comprehensive game mechanics
      // This method is kept for backward compatibility but now just returns
      // what's already in the cache
      
      // Get existing mechanics from cache
      const mechanics = this.cache[this.categories.GAME_MECHANICS]?.core || {};
      
      // Store the information
      await this.storeKnowledge(this.categories.GAME_MECHANICS, 'core', mechanics);
    }

    /**
     * Extract character information from scripts
     * @param {Array} scriptTexts - Array of script content
     */
    async extractCharacterInfo(scriptTexts) {
      // The updated knowledge base already contains comprehensive character information
      // This method is kept for backward compatibility
      
      // Get existing character data from cache
      const characters = this.cache[this.categories.CHARACTERS] || {};
      
      // Store each character separately
      for (const [key, character] of Object.entries(characters)) {
        await this.storeKnowledge(this.categories.CHARACTERS, key, character);
      }
    }

    /**
     * Extract locations information from scripts and HTML
     * @param {Array} scriptTexts - Array of script content
     */
    async extractLocationsInfo(scriptTexts) {
      // The updated knowledge base already contains comprehensive location information
      // This method is kept for backward compatibility
      
      // Get existing location data from cache
      const locations = this.cache[this.categories.LOCATIONS] || {};
      
      // Store each location separately
      for (const [key, location] of Object.entries(locations)) {
        await this.storeKnowledge(this.categories.LOCATIONS, key, location);
      }
    }

    /**
     * Extract items information from scripts
     * @param {Array} scriptTexts - Array of script content
     */
    async extractItemsInfo(scriptTexts) {
      // The updated knowledge base already contains comprehensive item information
      // This method is kept for backward compatibility
      
      // Get existing item data from cache
      const items = this.cache[this.categories.ITEMS] || {};
      
      // Store each item separately
      for (const [key, item] of Object.entries(items)) {
        await this.storeKnowledge(this.categories.ITEMS, key, item);
      }
    }

    /**
     * Extract abilities information from scripts
     * @param {Array} scriptTexts - Array of script content
     */
    async extractAbilitiesInfo(scriptTexts) {
      // The updated knowledge base already contains comprehensive ability information
      // This method is kept for backward compatibility
      
      // Get existing ability data from cache
      const abilities = this.cache[this.categories.ABILITIES] || {};
      
      // Store each ability separately
      for (const [key, ability] of Object.entries(abilities)) {
        await this.storeKnowledge(this.categories.ABILITIES, key, ability);
      }
    }

    /**
     * Get recommendations based on user context
     * @param {string} context - Context of the user's current state
     * @returns {Object} - Recommendations
     */
    async getRecommendations(context) {
      // Use context to determine what kind of recommendations to provide
      const recommendations = {
        suggested_topics: [],
        related_items: [],
        tip_of_the_day: ""
      };
      
      // Add default recommendations
      recommendations.suggested_topics = [
        "How to level up faster",
        "What items should I look for",
        "Tell me about the game world",
        "How does combat work",
        "How do I get new characters"
      ];
      
      // Add context-specific recommendations
      if (context.toLowerCase().includes('character')) {
        recommendations.suggested_topics.push(
          "What are the best characters",
          "How do I upgrade characters",
          "What are character shards"
        );
      } else if (context.toLowerCase().includes('item') || context.toLowerCase().includes('equipment')) {
        recommendations.suggested_topics.push(
          "What are the rarity levels",
          "How do I get legendary items",
          "What is the best equipment"
        );
      } else if (context.toLowerCase().includes('dungeon') || context.toLowerCase().includes('location')) {
        recommendations.suggested_topics.push(
          "What are the different locations",
          "What enemies are in each area",
          "How to get better dungeon rewards"
        );
      }
      
      // Add a random tip of the day
      const tips = [
        "Try exploring the Neon District for rare items!",
        "Use buff items before entering dungeons for better rewards.",
        "Characters with high intelligence excel at magic damage.",
        "Dual wield weapons generally have higher DPS but lower per-hit damage.",
        "The Quantum Void has the best legendary drop rates."
      ];
      recommendations.tip_of_the_day = tips[Math.floor(Math.random() * tips.length)];
      
      return recommendations;
    }
  }
  window.KnowledgeBase = KnowledgeBase;
}
