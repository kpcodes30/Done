// Landing Page Interactivity
document.addEventListener('DOMContentLoaded', () => {
    // Expand/Collapse Logic
    document.querySelectorAll('.toggle-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const node = trigger.closest('.tree-node');
            const children = node && node.querySelector('.node-children');
            const icon = trigger.querySelector('.toggle-icon');
            if (!children) return;
            const isHidden = children.classList.contains('hidden');
            children.classList.toggle('hidden', !isHidden);
            if (icon) icon.textContent = isHidden ? '[-]' : '[+]';
            node.setAttribute('data-expanded', String(isHidden));
        });
    });

    // Generic: compute percent for a tree-node based on its immediate children
    function computeProgressForNode(node) {
        const childrenContainer = node.querySelector('.node-children');
        if (!childrenContainer) return 0;
        const childEls = Array.from(childrenContainer.children).filter(c => c.nodeType === 1);
        if (childEls.length === 0) return 0;

        let sum = 0;
        let count = 0;

        childEls.forEach(child => {
            // Branch child (sub-tree)
            if (child.classList.contains('tree-node')) {
                // Try to use header's data-progress if available
                const header = child.querySelector('.task-clickable');
                let pct = 0;
                if (header && header.hasAttribute('data-progress')) {
                    pct = parseFloat(header.getAttribute('data-progress')) || 0;
                } else {
                    // Recurse
                    pct = computeProgressForNode(child);
                }
                sum += pct;
                count++;
            } else {
                // Could be a wrapper with a leaf task inside (or directly a task-clickable)
                const taskEl = child.matches('.task-clickable') ? child : child.querySelector('.task-clickable');
                if (taskEl) {
                    count++;
                    const checkbox = taskEl.querySelector('.task-checkbox');
                    const text = taskEl.querySelector('.task-text');
                    if (checkbox) {
                        sum += checkbox.classList.contains('bg-white') ? 100 : 0;
                    } else if (text) {
                        sum += text.classList.contains('line-through') ? 100 : 0;
                    } else {
                        // default 0
                        sum += 0;
                    }
                }
            }
        });

        if (count === 0) return 0;
        return sum / count;
    }

    function updateNodeProgress(node) {
        const header = node.querySelector('.task-clickable');
        if (!header) return;
        const pct = computeProgressForNode(node);
        const formatted = pct.toFixed(2);
        const progressBar = header.querySelector('.progress-bar');
        const progressText = header.querySelector('.progress-text');
        header.setAttribute('data-progress', String(pct));
        if (progressBar) progressBar.style.width = `${pct}%`;
        if (progressText) progressText.textContent = `${formatted}%`;
    }

    // Recompute up the chain from a starting element (task or tree-node)
    function recomputeUpFrom(startEl) {
        // Find the tree-node that contains this task
        let currentTree = startEl.closest('.tree-node');
        
        // If the clicked element IS the header of a tree-node, we need to update that node first
        // But wait, if we click a header, does its own progress change? 
        // No, a header's progress is derived from its children.
        // So if we click a leaf task, we update its parent tree-node.
        // If we click a header task (which shouldn't be clickable for completion in this model, but let's be safe),
        // we should look at its parent.
        
        // Actually, in this UI, only leaf tasks have checkboxes. 
        // Branch headers show progress bars.
        // So startEl is always a leaf task or a child of a tree-node.
        
        // Find the immediate parent tree-node of the clicked element
        // The clicked element is inside .node-children of some tree-node
        let parentNode = startEl.closest('.node-children')?.closest('.tree-node');
        
        // Walk upward updating each ancestor tree-node
        while (parentNode) {
            updateNodeProgress(parentNode);
            parentNode = parentNode.closest('.node-children')?.closest('.tree-node');
        }
    }

    // Task Completion Logic
    document.querySelectorAll('.task-clickable').forEach(task => {
        task.addEventListener('click', (e) => {
            e.stopPropagation();
            const text = task.querySelector('.task-text');
            const checkbox = task.querySelector('.task-checkbox');

            // Toggle done state visually
            if (text) {
                const wasDone = text.classList.contains('line-through');
                text.classList.toggle('line-through');
                text.classList.toggle('text-white/50', !wasDone);
                text.classList.toggle('text-white/90', wasDone);
            }
            if (checkbox) checkbox.classList.toggle('bg-white');

            // Update the closest parent tree-node progress, then bubble up
            recomputeUpFrom(task);
        });
    });

    // On load: compute all node progress values so top-level reflects defaults
    // We need to do this bottom-up so that parents have correct child data
    const allNodes = Array.from(document.querySelectorAll('.tree-node'));
    // Sort by depth (deepest first) to ensure children are computed before parents
    allNodes.sort((a, b) => {
        return b.querySelectorAll('.tree-node').length - a.querySelectorAll('.tree-node').length;
    });
    allNodes.forEach(node => updateNodeProgress(node));
});
