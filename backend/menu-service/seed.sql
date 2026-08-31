-- seed.sql
-- Populates menu_items with the Flavor Blitz starting menu.
-- Run after schema.sql: psql -U postgres -d flavorblitz -f seed.sql

INSERT INTO menu_items (id, category, name, description, price, heat) VALUES
    ('b1', 'burgers', 'Blitz Classic',            'Flame-grilled beef patty, cheddar, house sauce, pickles.', 6.50, 0),
    ('b2', 'burgers', 'Smoke & Char Double',      'Two patties, smoked bacon, caramelized onion, BBQ glaze.', 8.75, 1),
    ('b3', 'burgers', 'Ghost Pepper Burner',      'Beef patty, ghost pepper jam, pepper jack, jalapenos.',    8.25, 3),
    ('b4', 'burgers', 'Garden Blitz',             'Grilled plant patty, avocado, roasted pepper, chipotle mayo.', 7.25, 1),
    ('c1', 'chips',   'Skin-On Fries',            'Crisp-cut, sea salt, served hot.',                         3.00, 0),
    ('c2', 'chips',   'Loaded Chili Chips',       'Fries, house chili, melted cheese, spring onion.',         5.50, 2),
    ('c3', 'chips',   'Cajun Spiced Wedges',      'Skin-on wedges, cajun rub, garlic aioli.',                 4.00, 2),
    ('d1', 'drinks',  'House Cola',               'Classic, ice-cold, 500ml.',                                2.00, 0),
    ('d2', 'drinks',  'Mango Chili Cooler',       'Fresh mango, lime, a pinch of chili.',                     3.25, 1),
    ('d3', 'drinks',  'Sparkling Ginger Brew',    'House-brewed ginger, sparkling water.',                    3.00, 0)
ON CONFLICT (id) DO NOTHING;
