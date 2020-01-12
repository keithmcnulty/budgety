// BUDGET CONTROLLERS
var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalInc) {
        if (totalInc > 0) {
            this.percentage = Math.round((this.value * 100) / totalInc);
        } else {
            this.percentage = -1;
        }

    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {

        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });

        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, description, value) {
            var newItem, ID;

            if (data.allItems[type].length === 0) {
                ID = 0;
            } else {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }


            if (type === 'exp') {
                newItem = new Expense(ID, description, value);
            } else {
                newItem = new Income(ID, description, value);
            }

            data.allItems[type].push(newItem);
            return newItem;

        },

        deleteItem: function(type, id) {
            var ids = data.allItems[type].map(function(current) {
                return (current.id);
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {

            // calculate total income and exps
            calculateTotal('inc');
            calculateTotal('exp');


            // calculate budget = income - expenses
            data.budget = data.totals.inc - data.totals.exp;


            // calculate the % of income for each expense
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }


        },

        calculatePercentages: function() {

            data.allItems.exp.forEach(function(curr) {
                curr.calcPercentage(data.totals.inc);
            });
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            }
        },

        getPercentages: function() {

            var allPerc = [];
            data.allItems.exp.forEach(function(curr) {
                allPerc.push(curr.getPercentage());
            });

            return allPerc;

        },

        testing: function() {
            console.log(data);
        }
    }
})();

// UI CONTROLLER
var UIController = (function() {

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(number, type) {

        number = Math.abs(number);
        number = number.toFixed(2);
        var numSplit, int, dec;
        numSplit = number.split('.');
        int = numSplit[0];
        dec = numSplit[1];

        if (int.length > 3) {

            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);

        }

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    var nodeListForEach = function(list, callbackfn) {
        for (i = 0; i < list.length; i++) {
            callbackfn(list[i], i);
        }
    };

    return {
        getInput: function() {

            return {
                type: document.querySelector(DOMStrings.inputType).value, //'inc' or 'exp'

                description: document.querySelector(DOMStrings.inputDescription).value,

                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)

            }


        },


        addListItem: function(obj, type) {

            var html, newHtml, element;
            // 1. Add HTML item with some placeholder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // 2. Add data from item in replace of text

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%desc%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // 3. Add HTML to the DOM  

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function(selectorID) {

            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            // returns list - need array - convert

            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(current, index, array) {
                current.value = '';
            });

            fieldsArray[0].focus();


        },

        displayTotals: function(obj) {

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, obj.budget >= 0 ? 'inc' : 'exp');

            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');

            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }



        },

        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMStrings.expPercentageLabel);

            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }

            });

        },

        displayMonth: function() {

            var now, year, month;

            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;

        },

        changeType: function() {

            var fields = document.querySelectorAll(
                DOMStrings.inputType + ', ' +
                DOMStrings.inputDescription + ', ' +
                DOMStrings.inputValue);

            nodeListForEach(fields, function(curr) {
                curr.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');

        },

        getDOMStrings: function() {

            return DOMStrings;

        }

    }

})();




// APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', function() {
            ctrlAddItem();
        });

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };

    var updateBudget = function() {

        budgetCtrl.calculateBudget();

        var budgetTotals = budgetCtrl.getBudget();

        UICtrl.displayTotals(budgetTotals);

    };

    var updatePercentages = function() {

        // calc percentages
        budgetCtrl.calculatePercentages();

        // read them from budgetcontroller
        var Percentages = budgetCtrl.getPercentages();

        // update UI
        UICtrl.displayPercentages(Percentages);


    };

    var ctrlAddItem = function() {

        var input, newItem;
        // 1. Get input data
        input = UICtrl.getInput();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            // 2. Add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add item to UI

            UICtrl.addListItem(newItem, input.type);

            // 4. Clear inputs

            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();




        }

    };

    var ctrlDeleteItem = function(event) {
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            var splitID, type, id;
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);

            // delete item from data
            budgetCtrl.deleteItem(type, id);

            // delete item from UI
            UICtrl.deleteListItem(itemID);

            // update budget and percentages
            updateBudget();
            updatePercentages();
        }
    };

    return {
        init: function() {
            setupEventListeners();
            UICtrl.displayTotals({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            });
            UICtrl.displayMonth();
        }
    };

})(budgetController, UIController);

controller.init();