;; Author Felix Burr
(ns graph.core)
(use 'cheshire.core)

(defn convert_graph [graph]
  (def max_depth (atom 0.0)) ; remember max dept when exploring 
  (defn strip_graph_and_set_y_width [y node] ;; remove unnecessary keys and set y value
    (if (empty? (:children node))
      (do (swap! max_depth (partial max y))
          {:name (:name node) :y y :x 1.0 :children []})
      (reduce
       (fn [parent child]
         {:name (:name parent)
          :y (:y parent)
          :x (+ (:x parent) (:x child))
          :children (cons child (:children parent))})
       {:name (:name node)
        :y y
        :x 0.0
        :children []}
       (map (partial strip_graph_and_set_y_width (inc y)) (:children node)))))

  (defn set_node_positions [min_x node] ;; sets each node's position
    (defn get_offsets [start nodes] ;; helper to get the child's individual x offset
      (reverse (reduce
                (fn [offset child] ;; calculate the offset for a child
                  (cons (+ (:x child) (first offset)) offset))
                [start] ;; start with "min_x"
                nodes)))
    
    (if (empty? (:children node))
      (assoc node :x min_x :y @max_depth)
      (reduce 
       (fn [parent child]
         (assoc parent :children (conj (:children parent) child)))
       (assoc node :children [] :x min_x)
       (map set_node_positions
            (get_offsets min_x (:children node))
            (:children node)))))
  
  ((comp (partial set_node_positions 0.0) (partial strip_graph_and_set_y_width 0.0)) graph))
  (spit "model_big_parsed.json" (generate-string  (convert_graph (parse-string (slurp "model_big.json") true))))